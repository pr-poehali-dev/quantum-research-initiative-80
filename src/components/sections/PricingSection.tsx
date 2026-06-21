import { Check } from "lucide-react"

const plans = [
  {
    name: "Старт",
    description: "Идеален для пет-проектов и небольших команд",
    price: "0 ₽",
    period: "навсегда",
    features: ["До 3 участников", "5 проектов", "Базовая аналитика", "Поддержка сообщества", "1 ГБ хранилища"],
    cta: "Начать",
    highlighted: false,
  },
  {
    name: "Про",
    description: "Для растущих команд с высокими требованиями",
    price: "2 900 ₽",
    period: "/мес",
    features: [
      "Безлимит участников",
      "Безлимит проектов",
      "Расширенная аналитика",
      "Приоритетная поддержка",
      "100 ГБ хранилища",
      "Свои интеграции",
      "Доступ к API",
    ],
    cta: "Попробовать бесплатно",
    highlighted: true,
  },
  {
    name: "Бизнес",
    description: "Для крупных организаций с особыми требованиями",
    price: "По запросу",
    period: "",
    features: [
      "Все из тарифа Про",
      "Персональный менеджер",
      "Индивидуальный SLA",
      "On-premise развертывание",
      "Безлимит хранилища",
      "Расширенная безопасность",
      "Обучение и онбординг",
    ],
    cta: "Связаться с нами",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Тарифы</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-zinc-100 mb-4">
            Простые и понятные цены
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-balance text-lg">
            Никаких скрытых платежей. Никаких сюрпризов. Выберите подходящий план.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl border flex flex-col h-full ${
                plan.highlighted ? "bg-zinc-100 border-zinc-100" : "bg-zinc-900/50 border-zinc-800/50"
              }`}
            >
              {/* Plan Header */}
              <div className="mb-6">
                <h3
                  className={`font-heading text-xl font-semibold mb-2 ${
                    plan.highlighted ? "text-zinc-900" : "text-zinc-100"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlighted ? "text-zinc-600" : "text-zinc-500"}`}>{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={`font-display text-4xl font-bold ${plan.highlighted ? "text-zinc-900" : "text-zinc-100"}`}
                >
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? "text-zinc-600" : "text-zinc-500"}`}>{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 ${plan.highlighted ? "text-zinc-900" : "text-zinc-400"}`} />
                    <span className={`text-sm ${plan.highlighted ? "text-zinc-700" : "text-zinc-400"}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#"
                className={`block w-full py-3 px-6 text-center rounded-full font-medium text-sm transition-colors mt-auto ${
                  plan.highlighted
                    ? "bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                    : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
