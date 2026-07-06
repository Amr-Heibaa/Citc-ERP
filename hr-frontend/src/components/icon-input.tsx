import * as React from 'react'
import type { LucideIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/components/ui/utils'

type IconInputProps = React.ComponentProps<'input'> & {
  icon: LucideIcon
  trailing?: React.ReactNode
}

export function IconInput({ icon: Icon, trailing, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn('pl-9', trailing ? 'pr-11' : undefined, className)} {...props} />
      {trailing ? (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>
      ) : null}
    </div>
  )
}