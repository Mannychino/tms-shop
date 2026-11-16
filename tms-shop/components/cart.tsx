"use client";

import Image from 'next/image';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { naira, type Line, type Product } from '@/lib/money';

type Cart = {
  lines: Line[];
  setLines: (lines: Line[]) => void;
  ready: boolean;
};

const Context = createContext<Cart | null>(null);

export function useCart() {
  const cart = useContext(Context);
  if (!cart) throw new Error('Cart provider missing');
  return cart;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('tms-cart') || '[]');
      if (Array.isArray(stored)) {
        setLines(stored.filter(item =>
          typeof item?.productId === 'string' &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          item.quantity <= 1000
        ));
      }
    } catch {
      // Use an empty cart if saved data is invalid or storage is unavailable.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem('tms-cart', JSON.stringify(lines));
    } catch {
      // Keep the cart usable in memory when storage is unavailable.
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus();
    };
  }, [open]);

  return (
    <Context.Provider value={{ lines, setLines, ready }}>
      <nav className="s">
        <div className="ni">

          <Link className="brand" href="/" aria-label="The Merch Shop home">
  <Image
    src="/assets/redesign/tms-logo.jpg"
    alt="TMS"
    width={80}
    height={80}
    className="brand-mark"
  />
</Link>

          <div className="nl">
            <Link href="/#about">About</Link>
            <Link href="/#shop">Shop</Link>
            <Link href="/#process">Process</Link>
          </div>
          <button  ref={trigger}
            className="cartbtn"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label={`Open cart, ${itemCount} items`}
          >
            Cart <span>{itemCount}</span>
          </button>
        </div>
      </nav>

      {children}

      <div hidden={!open} className="scrim open" onClick={() => setOpen(false)} />
      <aside
        hidden={!open}
        className="drawer open"
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        onKeyDown={event => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'Tab') {
            const nodes = event.currentTarget.querySelectorAll<HTMLElement>('button,a');
            const first = nodes[0];
            const last = nodes[nodes.length - 1];

            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="dh">
          <h2>Your cart</h2>
          <button
            ref={close}
            className="x"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <CartLines />

        <Link
          className={`btn${lines.length ? '' : ' disabled'}`}
          href={lines.length ? '/checkout' : '/#shop'}
          onClick={() => setOpen(false)}
          aria-disabled={!lines.length}
        >
          {lines.length ? 'Checkout' : 'Browse collection'}
        </Link>
      </aside>
    </Context.Provider>
  );
}

function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(setProducts)
      .catch(() => {});
  }, []);

  return products;
}

function CartLines() {
  const { lines, setLines } = useCart();
  const products = useCatalog();
  const subtotal = lines.reduce((sum, line) => {
    const product = products.find(product => product.id === line.productId);
    return sum + (product?.price_kobo || 0) * line.quantity;
  }, 0);

  function decreaseQuantity(productId: string) {
    setLines(lines.flatMap(line => {
      if (line.productId !== productId) return [line];
      if (line.quantity > 1) return [{ ...line, quantity: line.quantity - 1 }];
      return [];
    }));
  }

  function increaseQuantity(productId: string) {
    setLines(lines.map(line =>
      line.productId === productId
        ? { ...line, quantity: line.quantity + 1 }
        : line
    ));
  }

  return (
    <div className="lines">
      {!lines.length && (
        <p className="empty">
          Your cart is empty.<br />
          <span>Add a piece from the collection to get started.</span>
        </p>
      )}

      {lines.map(line => {
        const product = products.find(product => product.id === line.productId);

        return (
          <div className="ln" key={line.productId}>
            {product?.image
              ? <img src={product.image} alt="" />
              : <div className="ln-image">TMS</div>}
            <div>
              <b>{product?.name || 'Product ' + line.productId}</b>
              {product && <small>{naira(product.price_kobo * line.quantity)}</small>}
            </div>
            <div className="q">
              <button
                aria-label={`Decrease ${product?.name || 'item'} quantity`}
                onClick={() => decreaseQuantity(line.productId)}
              >
                −
              </button>
              <span aria-live="polite">{line.quantity}</span>
              <button
                aria-label={`Increase ${product?.name || 'item'} quantity`}
                disabled={line.quantity >= 1000}
                onClick={() => increaseQuantity(line.productId)}
              >
                +
              </button>
            </div>
          </div>
        );
      })}

      <div className="tot b">
        <span>Subtotal</span>
        <span>{naira(subtotal)}</span>
      </div>
    </div>
  );
}
