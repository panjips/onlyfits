package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run gen-module.go <module_name>")
		os.Exit(1)
	}

	moduleName := strings.ToLower(os.Args[1])
	basePath := filepath.Join("internal", "modules", moduleName)

	dirs := []string{
		basePath,
	}

	for _, dir := range dirs {
		err := os.MkdirAll(dir, 0755)
		if err != nil {
			fmt.Printf("Error creating directory %s: %v\n", dir, err)
			os.Exit(1)
		}
	}

	files := map[string]string{
		filepath.Join(basePath, "module.go"):           fmt.Sprintf("package %s\n", moduleName),
		filepath.Join(basePath, "repository.go"):       fmt.Sprintf("package %s\n", moduleName),
		filepath.Join(basePath, "service.go"):          fmt.Sprintf("package %s\n", moduleName),
		filepath.Join(basePath, "entity.go"):           fmt.Sprintf("package %s\n", moduleName),
		filepath.Join(basePath, "dto.go"):              fmt.Sprintf("package %s\n", moduleName),
		filepath.Join(basePath, "handler.go"):          fmt.Sprintf("package %s\n", moduleName),
	}

	for path, content := range files {
		if _, err := os.Stat(path); err == nil {
			fmt.Printf("File %s already exists, skipping...\n", path)
			continue
		}
		err := os.WriteFile(path, []byte(content), 0644)
		if err != nil {
			fmt.Printf("Error writing file %s: %v\n", path, err)
			os.Exit(1)
		}
		fmt.Printf("Created: %s\n", path)
	}

	fmt.Printf("\nModule '%s' generated successfully at %s\n", moduleName, basePath)
}
