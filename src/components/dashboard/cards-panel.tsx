'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockCreditCards } from '@/lib/mock-data'
import { formatCardNumber } from '@/lib/formatters'
import { Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CardsPanel() {
    const cards = mockCreditCards

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                        My Cards <span className="text-muted-foreground">({cards.length})</span>
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Card
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Mini card previews */}
                <div className="space-y-2">
                    {cards.map((card, index) => (
                        <div
                            key={card.id}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm text-white transition-all cursor-pointer hover:opacity-90",
                                index === 0 && "bg-primary-dark",
                                index === 1 && "bg-primary",
                                index === 2 && "bg-primary-light"
                            )}
                        >
                            {card.bank_name}
                        </div>
                    ))}
                </div>

                {/* Featured card */}
                <div
                    className="relative w-full aspect-[1.6/1] rounded-xl p-5 text-white overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #4a7c4a 100%)',
                    }}
                >
                    {/* Card pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white/30" />
                        <div className="absolute top-8 right-8 w-24 h-24 rounded-full border border-white/20" />
                    </div>

                    {/* Card content */}
                    <div className="relative h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-white/60 mb-1">Bank of Merina</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-lg font-mono tracking-wider mb-4">
                                3234 8678 4234 7628
                            </p>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] text-white/60 uppercase mb-0.5">Card Holder name</p>
                                    <p className="text-sm font-medium">Maya Singh</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-white/60 uppercase mb-0.5">Expiry date</p>
                                    <p className="text-sm font-medium">08/24</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold italic">VISA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-10">
                        <ArrowDownLeft className="h-4 w-4 mr-2" />
                        Receive Money
                    </Button>
                    <Button variant="outline" className="h-10">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Send Money
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
