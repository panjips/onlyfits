import { Button } from "../ui/button";

interface TitlePageProps {
    title: string;
    description?: string;
    isAction?: boolean;
    actionLabel?: string;
    onAction?: () => void;
}

export const TitlePage = ({ title, description, isAction, actionLabel = "Add Organization", onAction }: TitlePageProps) => {
    return (
    <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
           <p className="text-muted-foreground">{description}</p>
        </div>
        {isAction && <Button onClick={onAction}>{actionLabel}</Button>}
      </div>
    );
};