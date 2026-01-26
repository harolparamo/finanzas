"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { goalSchema, type GoalFormValues } from "@/lib/validators"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useDataStore } from "@/store/data-store"
import { useUIStore } from "@/store/ui-store"

interface GoalFormProps {
    id?: string // For editing
}

export function GoalForm({ id }: GoalFormProps) {
    const { goals, addGoal, updateGoal } = useDataStore()
    const { closeModal } = useUIStore()

    const existingGoal = id ? goals.find((g) => g.id === id) : null

    const form = useForm<GoalFormValues>({
        resolver: zodResolver(goalSchema),
        defaultValues: {
            name: existingGoal?.name || "",
            target_amount: existingGoal?.target_amount || 0,
            target_date: existingGoal?.target_date ? new Date(existingGoal.target_date) : undefined,
            color: existingGoal?.color || "#22c55e",
            icon: existingGoal?.icon || "target",
        },
    })

    async function onSubmit(values: GoalFormValues) {
        try {
            if (id) {
                await updateGoal(id, values)
            } else {
                await addGoal(values)
            }
            closeModal()
        } catch (error) {
            console.error("Error saving goal:", error)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre de la Meta</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Viaje a Europa" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="target_amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto Objetivo</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="target_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha Límite (Opcional)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP", { locale: es })
                                            ) : (
                                                <span>Selecciona una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date()
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2 items-center">
                                        <Input type="color" className="p-1 h-10 w-12" {...field} />
                                        <span className="text-xs text-muted-foreground">{field.value}</span>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full">
                    {id ? "Guardar Cambios" : "Crear Meta"}
                </Button>
            </form>
        </Form>
    )
}
