"use client";

export default function SupportPage() {
  return (
    <div className="space-y-10 pb-10">
      <h1 className="text-2xl font-bold">Suporte</h1>
      <section className="bg-white rounded-xl shadow p-6">
        <p className="text-sm text-gray-500 mb-4">
          Abra um chamado para pagamentos, bugs e outras dúvidas.
        </p>
        <iframe
          src="https://ud9ik.share.hsforms.com/2g5h13O21TF-p-2yBP8H0XA"
          title="Formulário de suporte"
          className="w-full h-[600px] border-0"
        />
      </section>
    </div>
  );
}
