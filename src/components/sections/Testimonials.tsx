export function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading text-zemo-black mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg font-body text-zemo-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Zambia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-zemo-yellow rounded-full flex items-center justify-center">
                  <span className="text-zemo-black font-heading">M</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-sub-heading text-zemo-black">Mulenga K.</h4>
                  <p className="text-sm text-zemo-gray-600">Lusaka</p>
                </div>
              </div>
              <p className="text-base font-body text-zemo-gray-700 italic">
                "ZEMO made it so easy to find a car for my weekend trip to Livingstone. Great
                service and affordable prices!"
              </p>
              <div className="flex text-zemo-yellow mt-4">⭐⭐⭐⭐⭐</div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-zemo-yellow rounded-full flex items-center justify-center">
                  <span className="text-zemo-black font-heading">C</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-sub-heading text-zemo-black">Chanda M.</h4>
                  <p className="text-sm text-zemo-gray-600">Kitwe</p>
                </div>
              </div>
              <p className="text-base font-body text-zemo-gray-700 italic">
                "As a host, ZEMO has helped me earn extra income from my car. The platform is
                reliable and secure."
              </p>
              <div className="flex text-zemo-yellow mt-4">⭐⭐⭐⭐⭐</div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-zemo-yellow rounded-full flex items-center justify-center">
                  <span className="text-zemo-black font-heading">T</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-sub-heading text-zemo-black">Temba N.</h4>
                  <p className="text-sm text-zemo-gray-600">Ndola</p>
                </div>
              </div>
              <p className="text-base font-body text-zemo-gray-700 italic">
                "Excellent customer support and clean vehicles. ZEMO is now my go-to for car
                rentals."
              </p>
              <div className="flex text-zemo-yellow mt-4">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
