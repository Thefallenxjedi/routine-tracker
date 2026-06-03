"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createActivity,
  updateActivity,
} from "@/lib/actions/activities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTIVITY_CATEGORIES,
  type Activity,
  type ActivityCategory,
} from "@/types/database";

type ActivityFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity;
};

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
}: ActivityFormDialogProps) {
  const [name, setName] = useState(activity?.name ?? "");
  const [category, setCategory] = useState<ActivityCategory>(
    (activity?.category as ActivityCategory) ?? "General"
  );
  const [isPending, startTransition] = useTransition();
  const isEditing = !!activity;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setName(activity?.name ?? "");
      setCategory((activity?.category as ActivityCategory) ?? "General");
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = isEditing
        ? await updateActivity(activity.id, name, category)
        : await createActivity(name, category);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Activity updated" : "Activity created");
      onOpenChange(false);
      setName("");
      setCategory("General");
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Activity" : "New Activity"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the name or category."
                : "Add an activity you want to track daily."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Gym, Read Book"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ActivityCategory)}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
