// UI Components exports
export * from './alert'
export * from './badge'
export * from './button'
export * from './card'
export * from './slider'
export * from './table'

// Re-export common components for convenience
export { Alert, AlertDescription } from './alert'
export { Badge } from './badge'
export { Button } from './button'
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
export { Slider } from './slider'
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table'

// Additional UI components that might be needed
export const Input = ({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

export const Select = ({ children, value, onValueChange, ...props }: { 
  children: React.ReactNode; 
  value?: string; 
  onValueChange?: (value: string) => void;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <select
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      {...props}
    >
      {children}
    </select>
  )
}

export const SelectContent = ({ children, className, ...props }: {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

export const SelectItem = ({ children, value, className, ...props }: {
  children: React.ReactNode
  value: string
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground ${className || ''}`}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  )
}
export const SelectTrigger = ({ children }: { children: React.ReactNode }) => children
export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-muted-foreground">{placeholder}</span>
)

export const Tabs = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
)
export const TabsContent = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <div data-value={value}>{children}</div>
)
export const TabsList = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
    {children}
  </div>
)
export const TabsTrigger = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <button
    data-value={value}
    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
  >
    {children}
  </button>
)

export const Progress = ({ value, className }: { value?: number; className?: string }) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
    <div
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
)

export const Tooltip = ({ children }: { children: React.ReactNode }) => children
export const TooltipContent = ({ children }: { children: React.ReactNode }) => (
  <div className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md">
    {children}
  </div>
)
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => children
export const TooltipTrigger = ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & React.HTMLAttributes<HTMLElement>) => (
  <div {...props}>{children}</div>
)