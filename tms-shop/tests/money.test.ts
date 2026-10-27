import {test} from 'node:test';
import assert from 'node:assert/strict';
import {priceOrder,type Product} from '../lib/money.ts';
const product:Product={id:'1',name:'Tee',category:'Tees',price_kobo:1800000,description:'',image:'',active:true};
test('totals are computed from server prices in integer kobo',()=>{const result=priceOrder([product],[{productId:'1',quantity:2}],350000);assert.equal(result.total_kobo,3950000);});
test('rejects unavailable, duplicate and invalid quantities',()=>{for(const lines of [[{productId:'unknown',quantity:1}],[{productId:'1',quantity:0}],[{productId:'1',quantity:1.5}],[{productId:'1',quantity:1},{productId:'1',quantity:1}]])assert.throws(()=>priceOrder([product],lines,0));assert.throws(()=>priceOrder([{...product,active:false}],[{productId:'1',quantity:1}],0));});
