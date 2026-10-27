import {getProducts} from '@/lib/catalog';
import {Catalog} from '@/components/catalog';
export default async function Home(){const products=await getProducts();return <><header className="hero" id="home">
  <div className="hero-photo"><img src="/assets/hero.jpg" alt="Printed resort shirt worn by the sea" fetchPriority="high" /><span className="photo-caption">GOOD MERCH. EVERYWHERE.</span></div>
  <div className="w hc">
    <div className="eyebrow"><span className="status-dot"></span> THE MERCH SHOP · LAGOS, NG</div>
    <h1>Made for<br />your <em>people.</em></h1>
    <p>Your brand. Their favourite thing to wear. Custom apparel for the communities, ideas and moments that bring people together.</p>
    <div className="acts"><a className="btn" href="#shop">Explore the collection <span aria-hidden="true">↗</span></a><a className="text-link" href="#process">How we make it happen <span aria-hidden="true">↓</span></a></div>
    <div className="hero-foot"><span>DESIGN TO DELIVERY. HANDLED.</span><span>01 — THE TMS WAY</span></div>
  </div>
</header>
<div className="brand-strip" aria-label="Our focus"><div className="w"><span>FOR THE CULTURE.</span><span aria-hidden="true">✳</span><span>FOR THE COMMUNITY.</span><span aria-hidden="true">✳</span><span>FOR THE EVERYDAY.</span></div></div>

<section id="about"><div className="w two">
  <div>
    <div className="sh"><span className="eyebrow">01 / THE IDEA</span><h2>More than a logo.<br />A sense of belonging.</h2><p>TMS is a merch production house. We design with you, print on quality fabric, finish cleanly and deliver on the timeline we promise.</p></div>
    <div className="pill">
      <div><b>Premium materials</b><span>Comfortable fabrics and durable print that survives the wash.</span></div>
      <div><b>Bulk friendly</b><span>Structured for communities, events and large orders.</span></div>
      <div><b>Design support included</b><span>Send a logo or an idea; we turn it into a mockup you approve.</span></div>
    </div>
  </div>
  <figure className="about-photo"><img src="/assets/about-jersey.jpg" alt="Community jersey with custom graphics" loading="lazy" /><figcaption><span>DETAILS MAKE THE DIFFERENCE.</span><span>↗</span></figcaption></figure>
</div></section>

<section id="shop" style={{paddingTop:0}}><div className="w">
  <div className="sh collection-head"><div><span className="eyebrow">02 / PICK YOUR CANVAS</span><h2>Good things.<br />Made yours.</h2></div><p>The essentials, with your identity all over them. Prices per piece. Design support included.</p></div>
  <Catalog products={products} />
</div></section>

<section id="process" style={{paddingTop:0}}><div className="w">
  <div className="sh collection-head"><div><span className="eyebrow">03 / FROM IDEA TO IN YOUR HANDS</span><h2>You bring the vision.<br />We make it wearable.</h2></div><p>A clear process, considered details and support at every step.</p></div>
  <div className="steps">
    <div><span className="d">01</span><b>Brief &amp; approval</b><span>2–3 days</span></div>
    <div><span className="d">02</span><b>Mockup approval</b><span>2–5 days</span></div>
    <div><span className="d">03</span><b>Production</b><span>7–14 working days</span></div>
    <div><span className="d">04</span><b>Packaging &amp; delivery</b><span>2–5 days</span></div>
  </div>
</div></section>
<footer><div className="w"><div className="footer-top"><a className="d footer-wordmark" href="#home" aria-label="TMS home">TMS<span>✳</span></a><p>Made for your people.<br /><span>Custom merch. Lagos, Nigeria.</span></p><a className="text-link" href="#shop">Find your next favourite ↗</a></div><div className="footer-bottom"><span>THE MERCH SHOP</span><span>BRANDS. EVENTS. COMMUNITIES.</span><a href="#home">BACK TO TOP ↑</a></div></div></footer>

</>}
