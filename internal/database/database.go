package database

import (
	"context"
	"database/sql"
	"fitcore/internal/config"
	"fmt"
	"log"
	"runtime"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/joho/godotenv/autoload"
	"github.com/pressly/goose/v3"
)

type Service interface {
	Health() map[string]string
	Close() error
	GetPool() *pgxpool.Pool
}

type service struct {
	db *pgxpool.Pool
}

var (
	dbInstance      *service
	defaultMinConns = int32(runtime.NumCPU() * 2)
)

const (
	defaultMaxConns          = int32(4)
	defaultMaxConnLifetime   = time.Hour
	defaultMaxConnIdleTime   = time.Minute * 30
	defaultHealthCheckPeriod = time.Minute
	defaultConnectTimeout    = time.Second * 5
)

func configPool(DATABASE_URL string) *pgxpool.Config {
	cfg, err := pgxpool.ParseConfig(DATABASE_URL)
	if err != nil {
		log.Fatal("Failed to create a config, error: ", err)
	}

	cfg.MinConns = defaultMinConns
	cfg.MaxConns = defaultMaxConns
	cfg.MaxConnLifetime = defaultMaxConnLifetime
	cfg.MaxConnIdleTime = defaultMaxConnIdleTime
	cfg.HealthCheckPeriod = defaultHealthCheckPeriod
	cfg.ConnConfig.ConnectTimeout = defaultConnectTimeout

	cfg.PrepareConn = func(ctx context.Context, c *pgx.Conn) (bool, error) {
		log.Println("Preparing connection to the database!!")
		return true, nil
	}

	cfg.AfterRelease = func(c *pgx.Conn) bool {
		log.Println("After releasing the connection pool to the database!!")
		return true
	}

	cfg.BeforeClose = func(c *pgx.Conn) {
		log.Println("Closed the connection pool to the database!!")
	}

	return cfg
}

func createDB() {
	c := config.Get().Database
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%d/postgres?sslmode=disable", c.User, c.Password, c.Host, c.Port)

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, dsn)
	if err != nil {
		log.Printf("Warning: Could not connect to default 'postgres' db to check existence: %v", err)
		return
	}
	defer conn.Close(ctx)

	var exists bool
	err = conn.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)", c.Name).Scan(&exists)
	if err != nil {
		log.Printf("Warning: Could not check if database exists: %v", err)
		return
	}

	if !exists {
		log.Printf("Database '%s' does not exist. Creating...", c.Name)
		_, err = conn.Exec(ctx, fmt.Sprintf("CREATE DATABASE \"%s\"", c.Name))
		if err != nil {
			log.Fatalf("Failed to create database: %v", err)
		}
		log.Println("Database created successfully.")
	}
}


func runMigrations() {
	db, err := sql.Open("pgx", config.Get().Database.ConnStr)
	if err != nil {
		log.Fatalf("Failed to open db for migrations: %v", err)
	}
	defer db.Close()

	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatalf("Failed to set goose dialect: %v", err)
	}

	if err := goose.Up(db, "migrations"); err != nil {
		log.Printf("Warning: Failed to run migrations: %v", err)
	} else {
		log.Println("Migrations completed successfully.")
	}
}

func New() Service {
	if dbInstance != nil {
		return dbInstance
	}

	createDB()
	runMigrations()

	strConn := config.Get().Database.ConnStr
	poolConfig := configPool(strConn)

	cfg, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		log.Fatalln("Unable to create connection pool:", err)
	}

	dbInstance = &service{
		db: cfg,
	}

	return dbInstance
}

func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	err := s.db.Ping(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err)
		return stats
	}

	stats["status"] = "up"
	stats["message"] = "It's healthy"
	dbStats := s.db.Stat()
	stats["total_connections"] = strconv.Itoa(int(dbStats.TotalConns()))
	stats["acquire"] = strconv.Itoa(int(dbStats.AcquiredConns()))
	stats["idle"] = strconv.Itoa(int(dbStats.IdleConns()))
	stats["constructing"] = strconv.Itoa(int(dbStats.ConstructingConns()))
	stats["wait_duration"] = dbStats.EmptyAcquireWaitTime().String()

	return stats
}

func (s *service) Close() error {
	log.Printf("Disconnected from database")
	s.db.Close()
	return nil
}

func (s *service) GetPool() *pgxpool.Pool {
	return s.db
}
