"use client";

export default function SupportPage() {
  return (
    <div className="space-y-10 pb-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold">Suporte</h1>
        <p className="text-sm text-gray-500">
          Abra um chamado para pagamentos, bugs e outras dúvidas. Quanto mais
          detalhes, mais rápido conseguimos ajudar.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <span className="rounded-full bg-gray-100 px-3 py-1">
            Tempo médio de resposta: 1-2 dias úteis
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1">
            Atendimento: seg a sex, 9h-18h
          </span>
          <a
            className="rounded-full bg-gray-900 px-3 py-1 text-white"
            href="mailto:suporte@mentionone.com"
          >
            suporte@mentionone.com
          </a>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Formulário de suporte</h2>
            <a
              className="text-xs font-medium text-gray-500 hover:text-gray-900"
              href="https://ud9ik.share.hsforms.com/2g5h13O21TF-p-2yBP8H0XA"
              target="_blank"
              rel="noreferrer"
            >
              Abrir em nova aba
            </a>
          </div>
          <iframe
            src="https://ud9ik.share.hsforms.com/2g5h13O21TF-p-2yBP8H0XA"
            title="Formulário de suporte"
            className="w-full rounded-lg border border-gray-100 h-[980px] md:h-[1080px] xl:h-[1200px]"
            loading="lazy"
          />
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Dicas para agilizar
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Descreva o passo a passo para reproduzir.</li>
              <li>Informe data, horario e usuario afetado.</li>
              <li>Anexe prints ou videos do problema.</li>
              <li>Inclua o link da pagina ou relatorio.</li>
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Tipos de solicitacao
            </h3>
            <div className="mt-3 grid gap-2 text-sm text-gray-600">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                Pagamentos e faturamento
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                Problemas de acesso
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                Bugs e instabilidades
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                Sugestoes e melhorias
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Status do chamado
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              Voce recebera atualizacoes por email. Caso nao encontre, verifique
              a caixa de spam ou contate-nos pelo email de suporte.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
