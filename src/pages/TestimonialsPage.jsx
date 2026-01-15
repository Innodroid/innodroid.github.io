const testimonials = [
    {
        from: 'Tony Lenzi, CEO, <a href="http://www.tacitmobile.com">Tacit Mobile</a>',
        text: "We trusted Innodroid to take an existing suite of Android applications and overhaul them with the latest technologies. They delivered, with reduced maintenance costs and increased installs.",
    },
    {
        from: 'Jay Cann, CTO, <a href="http://macquarium.com" target="_blank">Macquarium</a>',
        text: "Innodroid has been an invaluable resource, delivering professional service and quality results every time. Fast, efficient, and technically savvy, they're a preferred partner for some of our highest profile clientele",
    },
    {
        from: 'Mark Enting, VP of IT, <a href="http://capt.org" target="_blank">CAPT</a>',
        text: "The work Innodroid has done for us and their approach to the projects has been handled with utmost professionalism and the finished product has always been stable, well done, and of the highest quality. Innodroid is also really good to work with because of a commitment to deliver a professional product, delivering what and when is promised as well as bringing experience and expertise to the project that goes well beyond ours.",
    },
    {
        from: 'Michael Karpovage, <a href="http://karpovagecreative.com" target="_blank">Karpovage Creative</a>',
        text: "Innodroid was the original developer for my company app. His expertise in programming proved fast, accurate, and even under budget. Always a true professional and helped me on a moment's notice. I was incredibly pleased with the outcome and I highly recommend Innodroid.",
    },
    {
        from: 'Garrett Seiger, <a href="http://longstreetsolutions.com/" target="_blank">Longstreet Solutions</a>',
        text: "Innodroid is a key partner for our mobile app development needs. Their expertise and experience in this area has been invaluable for us.",
    },
];

function TestimonialsPage() {
    return (
        <>
            <div className="jumbotron testimonials">
                <h1>testimonials</h1>
            </div>

            <div className="row">
                {testimonials.map((t) => (
                    <div key={t.from} className="col-md-6 testimonial">
                        <div className="well well-lg">
                            <div className="testimonial-container">
                                <div className="testimonial-quotechar">"</div>
                                <div className="testimonial-quote">{t.text}</div>
                            </div>
                            <br />
                            <br />
                            <div
                                className="from testimonial-from"
                                dangerouslySetInnerHTML={{ __html: t.from }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default TestimonialsPage;
