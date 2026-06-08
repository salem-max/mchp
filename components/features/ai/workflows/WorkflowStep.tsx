"use client"

interface WorkflowStepProps {
  title?: string
  description?: string
}

export default function WorkflowStep({ title = 'Step name', description = 'A step within the workflow.' }: WorkflowStepProps) {
  return (
    <div className="rounded-2xl border p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
