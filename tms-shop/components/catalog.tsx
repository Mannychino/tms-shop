'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { type Product, naira } from '@/lib/money';
import { useCart } from './cart';
import styles from './catalog.module.css';

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((response) =>
        response.ok ? response.json() : Promise.reject()
      )
      .then(setProducts)
      .catch(() => {});
  }, []);

  return products;
}

export function Catalog({ products }: { products: Product[] }) {
  const [category, setCategory] = useState('All');
  const [notice, setNotice] = useState('');
  const { lines, setLines, ready } = useCart();

  const activeProducts = products.filter((product) => product.active);

  const categories = [
    'All',
    ...new Set(activeProducts.map((product) => product.category)),
  ];

  const selectedCategory = categories.includes(category)
    ? category
    : 'All';

  const visibleProducts = activeProducts.filter(
    (product) =>
      selectedCategory === 'All' ||
      product.category === selectedCategory
  );

  useEffect(() => {
    if (!ready) return;

    const validLines = lines.filter((line) =>
      products.some(
        (product) =>
          product.id === line.productId && product.active
      )
    );

    if (validLines.length !== lines.length) {
      setLines(validLines);
      setNotice('Unavailable items were removed from your cart.');
    }
  }, [ready, lines, products, setLines]);

  function addProduct(product: Product, quantity: number) {
    const existing = lines.find(
      (line) => line.productId === product.id
    );

    const addedQuantity = Math.min(
      quantity,
      1000 - (existing?.quantity ?? 0)
    );

    if (addedQuantity === 0) {
      setNotice(`Your cart already contains 1,000 × ${product.name}.`);
      return;
    }

    setLines(
      existing
        ? lines.map((line) =>
            line.productId === product.id
              ? {
                  ...line,
                  quantity: line.quantity + addedQuantity,
                }
              : line
          )
        : [
            ...lines,
            {
              productId: product.id,
              quantity: addedQuantity,
            },
          ]
    );

    setNotice(
      `${addedQuantity} × ${product.name} added to your cart.`
    );
  }

  return (
    <>
      <div
        className={styles.filters}
        role="group"
        aria-label="Filter products by category"
      >
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={styles.filter}
            aria-pressed={selectedCategory === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <p className={styles.status} role="status" aria-live="polite">
        {notice}
      </p>

      <div className={styles.grid}>
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              ready={ready}
              onAdd={(quantity) => addProduct(product, quantity)}
            />
          ))
        ) : (
          <p className={styles.empty}>
            No products are available in this category yet.
          </p>
        )}
      </div>
    </>
  );
}

function ProductCard({
  product,
  ready,
  onAdd,
}: {
  product: Product;
  ready: boolean;
  onAdd: (quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <article className={styles.card}>
      <div className={styles.imageFrame}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
            className={styles.image}
          />
        ) : (
          <span>Photo coming soon</span>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.category}>{product.category}</p>

        <h3 className={styles.name}>{product.name}</h3>

        <p className={styles.description}>{product.description}</p>

        <p className={styles.price}>
          {naira(product.price_kobo)}
        </p>

        <div className={styles.actions}>
          <div
            className={styles.quantity}
            role="group"
            aria-label={`Quantity for ${product.name}`}
          >
            <button
              type="button"
              aria-label={`Decrease quantity for ${product.name}`}
              disabled={quantity === 1}
              onClick={() => setQuantity((value) => value - 1)}
            >
              −
            </button>

            <span aria-live="polite">{quantity}</span>

            <button
              type="button"
              aria-label={`Increase quantity for ${product.name}`}
              disabled={quantity === 1000}
              onClick={() => setQuantity((value) => value + 1)}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={styles.addButton}
            disabled={!ready}
            aria-label={`Add ${quantity} × ${product.name} to cart`}
            onClick={() => {
              onAdd(quantity);
              setQuantity(1);
            }}
          >
            Add to cart
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </article>
  );
}