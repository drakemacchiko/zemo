export function FeaturedVehicles() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading text-zemo-black mb-4">
            Featured Vehicles
          </h2>
          <p className="text-lg font-body text-zemo-gray-600 max-w-2xl mx-auto">
            Discover our most popular cars available for rent across Zambia
          </p>
        </div>

        {/* Placeholder for vehicle cards - will be implemented in Phase 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card group">
              <div className="h-48 bg-zemo-gray-200 rounded-t-zemo-lg loading-skeleton" />
              <div className="card-body">
                <div className="h-6 bg-zemo-gray-200 rounded loading-skeleton mb-2" />
                <div className="h-4 bg-zemo-gray-200 rounded loading-skeleton w-2/3 mb-4" />
                <div className="h-10 bg-zemo-gray-200 rounded loading-skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
