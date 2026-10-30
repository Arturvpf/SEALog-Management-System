import * as D from '@radix-ui/react-dialog'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/utils'
export const Dialog = D.Root
export const DialogTitle = ({ className, ...p }: ComponentPropsWithoutRef<typeof D.Title>) => <D.Title className={cn('font-display text-lg font-semibold text-foreground', className)} {...p}/>
export const DialogContent = ({ className, children, ...p }: ComponentPropsWithoutRef<typeof D.Content>) =>
  <D.Portal><D.Overlay className="fixed inset-0 z-50 bg-navy/40"/>
    <D.Content aria-describedby={undefined} className={cn('card fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%_-_2rem)] max-w-lg max-h-[85dvh] overflow-y-auto p-6 shadow-xl', className)} {...p}>{children}</D.Content></D.Portal>
