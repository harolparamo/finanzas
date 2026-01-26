"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { creditCardSchema as cardSchema, type CreditCardFormValues as CardFormValues } from "@/lib/validators"
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
import { useDataStore } from "@/store/data-store"
import { useUIStore } from "@/store/ui-store"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface CardFormProps {
    id?: string // For editing
}

const COLORS = [
    { name: "Azul", value: "#3b82f6" },
    { name: "Verde", value: "#22c55e" },
    { name: "Amarillo", value: "#eab308" },
    { name: "Rojo", value: "#ef4444" },
    { name: "Morado", value: "#a855f7" },
    { name: "Gris", value: "#64748b" },
    { name: "Negro", value: "#171717" },
]

export function CardForm({ id }: CardFormProps) {
    const { cards, addCard, updateCard } = useDataStore()
    const { closeModal } = useUIStore()

    const existingCard = id ? cards.find((c) => c.id === id) : null

    const form = useForm<CardFormValues>({
        resolver: zodResolver(cardSchema),
        defaultValues: {
            name: existingCard?.name || "",
            bank_name: existingCard?.bank_name || "",
            last_four_digits: existingCard?.last_four_digits || "",
            credit_limit: existingCard?.credit_limit || 0,
            cut_off_day: existingCard?.cut_off_day || 1,
            payment_day: existingCard?.payment_day || 1,
            color: existingCard?.color || "#3b82f6",
        },
    })

    async function onSubmit(values: CardFormValues) {
        try {
            if (id) {
                await updateCard(id, values)
            } else {
                await addCard(values)
            }
            closeModal()
        } catch (error) {
            console.error("Error saving card:", error)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la Tarjeta</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Visa Principal" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bank_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Banco</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Bancolombia" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="last_four_digits"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Últimos 4 dígitos</FormLabel>
                                <FormControl>
                                    <Input placeholder="1234" maxLength={4} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="credit_limit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cupo Total</FormLabel>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="cut_off_day"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Día de Corte</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={31}
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
                        name="payment_day"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Día de Pago</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={31}
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un color" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {COLORS.map((color) => (
                                        <SelectItem key={color.value} value={color.value}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: color.value }}
                                                />
                                                {color.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    {id ? "Guardar Cambios" : "Crear Tarjeta"}
                </Button>
            </form>
        </Form>
    )
}
