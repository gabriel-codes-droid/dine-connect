export default function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="page-container">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{description ?? `Manage your ${title.toLowerCase()} from this page.`}</p>
      </div>
      <div className="card-base p-16 text-center">
        <div className="w-16 h-16 bg-gradient-glass rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h3 className="text-lg font-semibold text-text-main dark:text-dark-text mb-2">{title}</h3>
        <p className="text-text-muted dark:text-dark-muted max-w-md mx-auto">
          This section is being built. Check back soon for full functionality.
        </p>
      </div>
    </div>
  );
}
