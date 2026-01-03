import Link from 'next/link';

export default function HomePage() {
  const sections = [
    {
      href: '/referencias',
      title: 'Referencias de la Investigación',
      description: 'Bibliografía y fuentes consultadas para la investigación',
    },
    {
      href: '/presentacion',
      title: 'Referencias de la Presentación',
      description: 'Material bibliográfico utilizado en la presentación',
    },
    {
      href: '/desarrollo',
      title: 'Artículos Desarrollados',
      description: 'Publicaciones y artículos generados durante el desarrollo',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-16">
      <main className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Biblioteca de Referencias
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Inteligencia Artificial Explicable para la Detección y Análisis de Hallazgos Mamográficos como apoyo al Diagnóstico de Cáncer de Mama
          </p>
        </div>

        <div className="grid gap-6">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                {section.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {section.description}
              </p>
              <div className="mt-4 flex items-center text-gray-900 dark:text-white font-semibold">
                Ver referencias
                <span className="ml-2 text-2xl group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
