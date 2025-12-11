import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixishConsoleStore } from "@/state/useFixishConsoleStore";
import { formatDistanceToNow } from "date-fns";

const TaskHistory = () => {
  const { history, historyLoading, actions } = useFixishConsoleStore();

  useEffect(() => {
    actions.loadHistory();
  }, [actions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Memory Engine</p>
            <h1 className="text-4xl font-light mt-2">Task History</h1>
            <p className="text-sm text-slate-400">Resume any Fixish session or audit past orchestration trails.</p>
          </div>
          <Button asChild variant="secondary">
            <Link to="/">Return to Console</Link>
          </Button>
        </header>

        {historyLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-2xl bg-slate-900/70" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {history.length === 0 && (
              <Card className="bg-slate-900/70 border-white/10">
                <CardHeader>
                  <CardTitle>No stored tasks yet</CardTitle>
                  <CardDescription>Run the console to automatically archive missions.</CardDescription>
                </CardHeader>
              </Card>
            )}
            {history.map((task) => (
              <Card key={task.id} className="bg-slate-900/70 border-white/10 flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{task.name}</CardTitle>
                    <Badge variant="outline" className="border-white/20 text-slate-200">
                      {task.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Task ID <span className="font-mono text-slate-200">{task.id}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      void actions.resumeTask(task);
                    }}
                  >
                    Resume
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskHistory;
