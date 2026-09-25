import test from 'node:test';
import assert from 'node:assert/strict';
import {readingRoom,tableCrop,sceneAsset} from '../reading-room.js';
import {authorPortrait} from '../authors.js';

test('local time has four continuous room periods, including midnight',()=>{
  for(const h of [0,5,21,23])assert.equal(readingRoom(h),'night');
  for(const h of [6,11])assert.equal(readingRoom(h),'morning');
  for(const h of [12,16])assert.equal(readingRoom(h),'afternoon');
  for(const h of [17,20])assert.equal(readingRoom(h),'evening');
});
test('room crops fill the viewport while keeping the table below the books',()=>{
  for(const [w,h,iw,ih] of [[1512,790,1536,1024],[1280,660,1536,1024],[393,734,1024,1536],[375,548,1024,1536],[820,1080,1024,1536]]){
    for(const edge of [.35,.55,.7]){
      const tableY=ih*(iw>ih?.64:.51),edgeY=h*edge,c=tableCrop(w,h,iw,ih,tableY,edgeY);
      assert.ok(Math.abs((tableY-c.y)*c.scale-edgeY)<.001);
      assert.ok(c.x>=-.001&&c.y>=-.001);
      assert.ok(c.x+c.w<=iw+.001&&c.y+c.h<=ih+.001);
      assert.ok(Math.abs(c.w*c.scale-w)<.001&&Math.abs(c.h*c.scale-h)<.001);
    }
  }
});
test('room assets resolve independently of the signature scenes',()=>{
  assert.equal(sceneAsset('table-night',false),'table-night-phone');
  assert.equal(sceneAsset('table-morning',true),'table-morning-wide');
  assert.equal(sceneAsset('frankenstein',true),'room-wide');
  assert.equal(sceneAsset('odyssey',false),'scene-odyssey-phone');
});
test('portraits are shared across an author’s works, never invented for unknown authors',()=>{
  assert.equal(authorPortrait('Fyodor Dostoevsky').src,authorPortrait('Fyodor Dostoyevsky').src);
  assert.match(authorPortrait('Homer').alt,/imagined likeness/);
  assert.equal(authorPortrait('Various'),null);
});
