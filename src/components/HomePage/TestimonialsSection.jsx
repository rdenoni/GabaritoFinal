import React from 'react';

const TestimonialsSection = () => {
    const testimonials = [
        { id: 1, avatar: "https://c.animaapp.com/piTrqSMl/img/rectangle-3@2x.png", quote: 'Demorei pra começar a estudar, um amigo me indicou esse site, gostei bastante me salvou".', username: "@danielyag", timestamp: "2 dias atrás..." },
        { id: 2, avatar: "https://c.animaapp.com/piTrqSMl/img/rectangle-3-1@2x.png", quote: 'Plataforma incrível! As questões são muito parecidas com as da prova real. Recomendo!', username: "@fariseug", timestamp: "5 dias atrás..." },
        { id: 3, avatar: "https://c.animaapp.com/piTrqSMl/img/rectangle-3-2@2x.png", quote: 'Finalmente um lugar com feedback detalhado. Ajuda muito a entender os erros.', username: "@rafad9r", timestamp: "1 semana atrás..." },
    ];

    return (
        // ALTERADO: Espaçamento vertical padronizado
        <section style={{backgroundColor: 'var(--color-bg-features)'}} className="w-full px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto">
                <h2 style={{font: 'var(--font-h1)'}} className="text-center text-text-primary mb-12">O que estão falando sobre nós?</h2>
                <div className="flex flex-col gap-6">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 border-l-8 border-[--color-accent]">
                            <img className="w-24 h-24 object-cover rounded-lg flex-shrink-0" alt={`Avatar do usuário ${testimonial.username}`} src={testimonial.avatar} />
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                    <span style={{font: 'var(--font-p-small)'}} className="text-gray-900 font-bold">{testimonial.username}</span>
                                    <span style={{font: 'var(--font-p-small)'}} className="text-gray-500">{testimonial.timestamp}</span>
                                </div>
                                <p style={{font: 'var(--font-p)'}} className="text-gray-700">{`"${testimonial.quote}"`}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;