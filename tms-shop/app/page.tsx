import {getProducts} from '@/lib/catalog';
import { Hero } from '@/components/home/hero';
import {Catalog} from '@/components/catalog';
import { About } from '@/components/home/about';
export default async function Home(){
  const products=await getProducts();return <> 
  
  <Hero />

<About />

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
</div>
</section>

<footer><div className="w"><div className="footer-top"><a className="d footer-wordmark" href="#home" aria-label="TMS home">TMS<span>✳</span></a><p>Made for your people.<br /><span>Custom merch. Lagos, Nigeria.</span></p><a className="text-link" href="#shop">Find your next favourite ↗</a></div><div className="footer-bottom"><span>THE MERCH SHOP</span><span>BRANDS. EVENTS. COMMUNITIES.</span><a href="#home">BACK TO TOP ↑</a></div></div></footer>

</>}
