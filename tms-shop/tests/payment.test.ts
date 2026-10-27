import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {validSignature} from '../lib/payment-signature.ts';
test('signature requires exact unmodified raw body and secret',()=>{const body='{"event":"charge.success"}',secret='test-secret';const signature=createHmac('sha512',secret).update(body).digest('hex');assert.equal(validSignature(body,signature,secret),true);assert.equal(validSignature(body+' ',signature,secret),false);assert.equal(validSignature(body,signature,'other'),false);assert.equal(validSignature(body,'bad',secret),false);});
