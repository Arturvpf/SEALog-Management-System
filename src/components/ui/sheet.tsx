import * as D from '@radix-ui/react-dialog'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/utils'
export const Sheet = D.Root
export const SheetTitle = ({ className, ...p }: ComponentPropsWithoutRef<typeof D.Title>) => <D.Title className={cn('font-display font-semibold text-foreground', className)} {...p}/>
export const SheetContent = ({ className, children, ...p }: ComponentPropsWithoutRef<typeof D.Content>) =>
  <D.Portal><D.Overlay className="fixed inset-0 z-50 bg-navy/40"/>
    <D.Content aria-describedby={undefined} className={cn('fixed inset-y-0 right-0 z-50 w-full border-l bg-background overflow-y-auto p-5 shadow-xl sm:max-w-[480px] sm:p-6', className)} {...p}>{children}</D.Content></D.Portal>
