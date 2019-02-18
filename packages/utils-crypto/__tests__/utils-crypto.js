import { Readable, Writable, pipeline } from 'stream'
import { promisify } from 'util'

import {
  BOX_PUBLICKEYBYTES,
  BOX_SECRETKEYBYTES,
  BOX_SEEDBYTES,
  GENERICHASH_BYTES,
  GENERICHASH_BYTES_MIN,
  PASSWORDHASH_MEMLIMIT_MIN,
  PASSWORDHASH_OPSLIMIT_MIN,
  PASSWORDHASH_SALTBYTES,
  SECRETBOX_KEYBYTES,
  SECRETBOX_NONCEBYTES,
  SECRETSTREAM_CHUNKBYTES_PLAINTEXT,
  SECRETSTREAM_KEYBYTES,
  SIGN_BYTES,
  SIGN_PUBLICKEYBYTES,
  SIGN_SECRETKEYBYTES,
  SIGN_SEEDBYTES,
  createBoxKeyPair,
  createBoxKeyPairFromSign,
  createBoxPublicFromSign,
  createDecryptStream,
  createEncryptStream,
  createPasswordHashSalt,
  createSecretBoxKey,
  createSecretBoxKeyFromPassword,
  createSecretStreamKey,
  createSignKeyPair,
  decryptBox,
  decryptSecretBox,
  encryptBox,
  encryptSecretBox,
  getSignature,
  hash,
  hashPassword,
  hashStream,
  openSigned,
  randomBytes,
  secureRandomBytes,
  sign,
  verifySignature,
} from '..'

const asyncPipeline = promisify(pipeline)

class BufferToStream extends Readable {
  constructor(data, chunkSize = 1024) {
    super()
    this._chunkSize = chunkSize
    this._data = data
  }

  _read() {
    const chunk = this._data.slice(0, this._chunkSize)
    if (chunk.length === 0) {
      this.push(null)
    } else {
      this._data = this._data.slice(this._chunkSize)
      this.push(chunk)
    }
  }
}

const toStream = (text, chunkSize) => {
  return new BufferToStream(Buffer.from(text), chunkSize)
}

class StreamToBuffer extends Writable {
  constructor() {
    super()
    this.buffer = Buffer.alloc(0)
  }

  _write(chunk, encoding, cb) {
    this.buffer = Buffer.concat([this.buffer, chunk])
    cb()
  }
}

const LOREM_IPSUM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut tellus dignissim, posuere lacus eu, dictum lorem. Pellentesque nulla nulla, euismod at fringilla vel, hendrerit at nibh. Duis euismod pellentesque ex a eleifend. Phasellus in enim in lectus viverra consequat. Donec id tellus vel lorem congue semper. Etiam quis arcu quis dolor tempus ultricies eu non ligula. Cras tristique metus massa, in ornare turpis varius vel. Cras faucibus congue ex sed bibendum. Vestibulum ornare nulla quis venenatis bibendum. Nulla facilisi. Integer sed arcu erat. Phasellus gravida enim vel felis pharetra pretium in luctus diam. Duis eleifend viverra risus et condimentum.Aenean lorem tellus, venenatis a justo non, fermentum faucibus nulla. Nullam at ultrices ante, ut euismod neque. Nulla facilisi. Integer massa enim, fringilla sed pharetra vel, elementum ut purus. Pellentesque eget volutpat enim. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur at tortor id dui condimentum aliquam in et turpis. Integer eu semper lacus. Nulla consequat enim non luctus ultrices. Vivamus porttitor quam et dui placerat condimentum. Donec eleifend velit vitae sapien dictum fermentum. Nulla egestas sem quis sodales pharetra. Maecenas volutpat ligula sem, nec faucibus elit malesuada ac. Morbi purus nisl, aliquet vitae dolor sit amet, tristique blandit nulla. Duis eleifend augue posuere sem molestie sodales. Aenean at molestie nisl. In posuere, risus cursus pulvinar sagittis, tortor turpis viverra purus, pellentesque faucibus turpis dolor quis odio. Quisque dictum enim mi, et volutpat nulla hendrerit at. Duis aliquam purus eu varius tincidunt. Aliquam ut efficitur est. Sed porta et justo vitae luctus. Etiam consequat leo eu porta rhoncus. Maecenas vel metus sit amet elit eleifend suscipit. Suspendisse efficitur, eros vel iaculis tincidunt, est libero cursus nulla, ac viverra mauris enim ac eros. Morbi condimentum tempor ullamcorper. Proin ornare dignissim efficitur. Nulla ac vehicula velit. Morbi mauris turpis, auctor sed justo nec, suscipit dictum mauris. Pellentesque vel metus vel augue finibus gravida. Donec sed lectus ultrices, lobortis nibh a, elementum tellus. Fusce ac quam finibus, imperdiet orci sit amet, semper est. Morbi sit amet mi massa. Mauris quis tincidunt dui, vel efficitur ligula. Integer ac mauris sed justo condimentum tincidunt sit amet eget ante. In vitae rhoncus augue. Nulla et mattis libero. Suspendisse vitae lacus et nulla cursus ultrices. Maecenas ultrices est nec consequat feugiat. Vivamus rutrum velit ac rutrum cursus. Vivamus finibus ut erat eleifend dictum. Quisque interdum velit et justo consectetur, non ornare eros aliquet. Vivamus varius mauris volutpat, blandit dui nec, rutrum ex. Nunc faucibus laoreet velit eu imperdiet. In purus nulla, lobortis at lectus quis, vulputate imperdiet ipsum. Donec quis luctus risus. Quisque eleifend urna id gravida imperdiet. Maecenas eget lectus felis. Aliquam euismod bibendum risus. Vestibulum eget viverra sem. Donec eros justo, sollicitudin condimentum porttitor sit amet, venenatis eget arcu. Aenean lacinia est sed est iaculis mattis. Ut ligula lorem, lobortis quis aliquam at, ultrices at massa. In sit amet magna sit amet justo convallis tristique. Aenean elementum dignissim purus ut dictum. Integer eget fermentum ante. In hac habitasse platea dictumst. Proin vel interdum neque. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Proin consequat fringilla felis et mollis. Aenean metus dui, iaculis cursus feugiat et, placerat vel magna. Ut id dui sed orci sollicitudin suscipit. Vestibulum molestie pretium dui eu lacinia. Aenean diam elit, hendrerit vitae lorem at, cursus elementum nibh. Pellentesque convallis id lorem ac tristique. Morbi sit amet metus hendrerit, dignissim felis id, rutrum sem. Nunc pulvinar tincidunt molestie. Nullam rhoncus, erat quis vehicula rutrum, mauris ex pulvinar lectus, volutpat sollicitudin dolor ligula vitae augue. Quisque sapien nibh, aliquam in hendrerit a, ultricies eget lectus. Nam commodo interdum arcu, quis eleifend metus vulputate ac. Vestibulum ut malesuada odio. Sed in magna sed tellus dictum ultrices. Nam ut leo suscipit, accumsan erat et, molestie velit. Morbi eu dignissim nisl. Donec finibus enim sed sem dictum vestibulum. Aenean tincidunt nisl lacus, ut bibendum lectus bibendum ac. Nulla molestie nisl arcu, eget venenatis urna volutpat malesuada. Aliquam erat volutpat. Nullam tempus nibh in augue lacinia, vel dictum eros tempor. Nunc id urna sit amet quam rutrum tempor sed sed mi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut tellus dignissim, posuere lacus eu, dictum lorem. Pellentesque nulla nulla, euismod at fringilla vel, hendrerit at nibh. Duis euismod pellentesque ex a eleifend. Phasellus in enim in lectus viverra consequat. Donec id tellus vel lorem congue semper. Etiam quis arcu quis dolor tempus ultricies eu non ligula. Cras tristique metus massa, in ornare turpis varius vel. Cras faucibus congue ex sed bibendum. Vestibulum ornare nulla quis venenatis bibendum. Nulla facilisi. Integer sed arcu erat. Phasellus gravida enim vel felis pharetra pretium in luctus diam. Duis eleifend viverra risus et condimentum.Aenean lorem tellus, venenatis a justo non, fermentum faucibus nulla. Nullam at ultrices ante, ut euismod neque. Nulla facilisi. Integer massa enim, fringilla sed pharetra vel, elementum ut purus. Pellentesque eget volutpat enim. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur at tortor id dui condimentum aliquam in et turpis. Integer eu semper lacus. Nulla consequat enim non luctus ultrices. Vivamus porttitor quam et dui placerat condimentum. Donec eleifend velit vitae sapien dictum fermentum. Nulla egestas sem quis sodales pharetra. Maecenas volutpat ligula sem, nec faucibus elit malesuada ac. Morbi purus nisl, aliquet vitae dolor sit amet, tristique blandit nulla. Duis eleifend augue posuere sem molestie sodales. Aenean at molestie nisl. In posuere, risus cursus pulvinar sagittis, tortor turpis viverra purus, pellentesque faucibus turpis dolor quis odio. Quisque dictum enim mi, et volutpat nulla hendrerit at. Duis aliquam purus eu varius tincidunt. Aliquam ut efficitur est. Sed porta et justo vitae luctus. Etiam consequat leo eu porta rhoncus. Maecenas vel metus sit amet elit eleifend suscipit. Suspendisse efficitur, eros vel iaculis tincidunt, est libero cursus nulla, ac viverra mauris enim ac eros. Morbi condimentum tempor ullamcorper. Proin ornare dignissim efficitur. Nulla ac vehicula velit. Morbi mauris turpis, auctor sed justo nec, suscipit dictum mauris. Pellentesque vel metus vel augue finibus gravida. Donec sed lectus ultrices, lobortis nibh a, elementum tellus. Fusce ac quam finibus, imperdiet orci sit amet, semper est. Morbi sit amet mi massa. Mauris quis tincidunt dui, vel efficitur ligula. Integer ac mauris sed justo condimentum tincidunt sit amet eget ante. In vitae rhoncus augue. Nulla et mattis libero. Suspendisse vitae lacus et nulla cursus ultrices. Maecenas ultrices est nec consequat feugiat. Vivamus rutrum velit ac rutrum cursus. Vivamus finibus ut erat eleifend dictum. Quisque interdum velit et justo consectetur, non ornare eros aliquet. Vivamus varius mauris volutpat, blandit dui nec, rutrum ex. Nunc faucibus laoreet velit eu imperdiet. In purus nulla, lobortis at lectus quis, vulputate imperdiet ipsum. Donec quis luctus risus. Quisque eleifend urna id gravida imperdiet. Maecenas eget lectus felis. Aliquam euismod bibendum risus. Vestibulum eget viverra sem. Donec eros justo, sollicitudin condimentum porttitor sit amet, venenatis eget arcu. Aenean lacinia est sed est iaculis mattis. Ut ligula lorem, lobortis quis aliquam at, ultrices at massa. In sit amet magna sit amet justo convallis tristique. Aenean elementum dignissim purus ut dictum. Integer eget fermentum ante. In hac habitasse platea dictumst. Proin vel interdum neque. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Proin consequat fringilla felis et mollis. Aenean metus dui, iaculis cursus feugiat et, placerat vel magna. Ut id dui sed orci sollicitudin suscipit. Vestibulum molestie pretium dui eu lacinia. Aenean diam elit, hendrerit vitae lorem at, cursus elementum nibh. Pellentesque convallis id lorem ac tristique. Morbi sit amet metus hendrerit, dignissim felis id, rutrum sem. Nunc pulvinar tincidunt molestie. Nullam rhoncus, erat quis vehicula rutrum, mauris ex pulvinar lectus, volutpat sollicitudin dolor ligula vitae augue. Quisque sapien nibh, aliquam in hendrerit a, ultricies eget lectus. Nam commodo interdum arcu, quis eleifend metus vulputate ac. Vestibulum ut malesuada odio. Sed in magna sed tellus dictum ultrices. Nam ut leo suscipit, accumsan erat et, molestie velit. Morbi eu dignissim nisl. Donec finibus enim sed sem dictum vestibulum. Aenean tincidunt nisl lacus, ut bibendum lectus bibendum ac. Nulla molestie nisl arcu, eget venenatis urna volutpat malesuada. Aliquam erat volutpat. Nullam tempus nibh in augue lacinia, vel dictum eros tempor. Nunc id urna sit amet quam rutrum tempor sed sed mi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut tellus dignissim, posuere lacus eu, dictum lorem. Pellentesque nulla nulla, euismod at fringilla vel, hendrerit at nibh. Duis euismod pellentesque ex a eleifend. Phasellus in enim in lectus viverra consequat. Donec id tellus vel lorem congue semper. Etiam quis arcu quis dolor tempus ultricies eu non ligula. Cras tristique metus massa, in ornare turpis varius vel. Cras faucibus congue ex sed bibendum. Vestibulum ornare nulla quis venenatis bibendum. Nulla facilisi. Integer sed arcu erat. Phasellus gravida enim vel felis pharetra pretium in luctus diam. Duis eleifend viverra risus et condimentum.Aenean lorem tellus, venenatis a justo non, fermentum faucibus nulla. Nullam at ultrices ante, ut euismod neque. Nulla facilisi. Integer massa enim, fringilla sed pharetra vel, elementum ut purus. Pellentesque eget volutpat enim. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur at tortor id dui condimentum aliquam in et turpis. Integer eu semper lacus. Nulla consequat enim non luctus ultrices. Vivamus porttitor quam et dui placerat condimentum. Donec eleifend velit vitae sapien dictum fermentum. Nulla egestas sem quis sodales pharetra. Maecenas volutpat ligula sem, nec faucibus elit malesuada ac. Morbi purus nisl, aliquet vitae dolor sit amet, tristique blandit nulla. Duis eleifend augue posuere sem molestie sodales. Aenean at molestie nisl. In posuere, risus cursus pulvinar sagittis, tortor turpis viverra purus, pellentesque faucibus turpis dolor quis odio. Quisque dictum enim mi, et volutpat nulla hendrerit at. Duis aliquam purus eu varius tincidunt. Aliquam ut efficitur est. Sed porta et justo vitae luctus. Etiam consequat leo eu porta rhoncus. Maecenas vel metus sit amet elit eleifend suscipit. Suspendisse efficitur, eros vel iaculis tincidunt, est libero cursus nulla, ac viverra mauris enim ac eros. Morbi condimentum tempor ullamcorper. Proin ornare dignissim efficitur. Nulla ac vehicula velit. Morbi mauris turpis, auctor sed justo nec, suscipit dictum mauris. Pellentesque vel metus vel augue finibus gravida. Donec sed lectus ultrices, lobortis nibh a, elementum tellus. Fusce ac quam finibus, imperdiet orci sit amet, semper est. Morbi sit amet mi massa. Mauris quis tincidunt dui, vel efficitur ligula. Integer ac mauris sed justo condimentum tincidunt sit amet eget ante. In vitae rhoncus augue. Nulla et mattis libero. Suspendisse vitae lacus et nulla cursus ultrices. Maecenas ultrices est nec consequat feugiat. Vivamus rutrum velit ac rutrum cursus. Vivamus finibus ut erat eleifend dictum. Quisque interdum velit et justo consectetur, non ornare eros aliquet. Vivamus varius mauris volutpat, blandit dui nec, rutrum ex. Nunc faucibus laoreet velit eu imperdiet. In purus nulla, lobortis at lectus quis, vulputate imperdiet ipsum. Donec quis luctus risus. Quisque eleifend urna id gravida imperdiet. Maecenas eget lectus felis. Aliquam euismod bibendum risus. Vestibulum eget viverra sem. Donec eros justo, sollicitudin condimentum porttitor sit amet, venenatis eget arcu. Aenean lacinia est sed est iaculis mattis. Ut ligula lorem, lobortis quis aliquam at, ultrices at massa. In sit amet magna sit amet justo convallis tristique. Aenean elementum dignissim purus ut dictum. Integer eget fermentum ante. In hac habitasse platea dictumst. Proin vel interdum neque. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Proin consequat fringilla felis et mollis. Aenean metus dui, iaculis cursus feugiat et, placerat vel magna. Ut id dui sed orci sollicitudin suscipit. Vestibulum molestie pretium dui eu lacinia. Aenean diam elit, hendrerit vitae lorem at, cursus elementum nibh. Pellentesque convallis id lorem ac tristique. Morbi sit amet metus hendrerit, dignissim felis id, rutrum sem. Nunc pulvinar tincidunt molestie. Nullam rhoncus, erat quis vehicula rutrum, mauris ex pulvinar lectus, volutpat sollicitudin dolor ligula vitae augue. Quisque sapien nibh, aliquam in hendrerit a, ultricies eget lectus. Nam commodo interdum arcu, quis eleifend metus vulputate ac. Vestibulum ut malesuada odio. Sed in magna sed tellus dictum ultrices. Nam ut leo suscipit, accumsan erat et, molestie velit. Morbi eu dignissim nisl. Donec finibus enim sed sem dictum vestibulum. Aenean tincidunt nisl lacus, ut bibendum lectus bibendum ac. Nulla molestie nisl arcu, eget venenatis urna volutpat malesuada. Aliquam erat volutpat. Nullam tempus nibh in augue lacinia, vel dictum eros tempor. Nunc id urna sit amet quam rutrum tempor sed sed mi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut tellus dignissim, posuere lacus eu, dictum lorem. Pellentesque nulla nulla, euismod at fringilla vel, hendrerit at nibh. Duis euismod pellentesque ex a eleifend. Phasellus in enim in lectus viverra consequat. Donec id tellus vel lorem congue semper. Etiam quis arcu quis dolor tempus ultricies eu non ligula. Cras tristique metus massa, in ornare turpis varius vel. Cras faucibus congue ex sed bibendum. Vestibulum ornare nulla quis venenatis bibendum. Nulla facilisi. Integer sed arcu erat. Phasellus gravida enim vel felis pharetra pretium in luctus diam. Duis eleifend viverra risus et condimentum.Aenean lorem tellus, venenatis a justo non, fermentum faucibus nulla. Nullam at ultrices ante, ut euismod neque. Nulla facilisi. Integer massa enim, fringilla sed pharetra vel, elementum ut purus. Pellentesque eget volutpat enim. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur at tortor id dui condimentum aliquam in et turpis. Integer eu semper lacus. Nulla consequat enim non luctus ultrices. Vivamus porttitor quam et dui placerat condimentum. Donec eleifend velit vitae sapien dictum fermentum. Nulla egestas sem quis sodales pharetra. Maecenas volutpat ligula sem, nec faucibus elit malesuada ac. Morbi purus nisl, aliquet vitae dolor sit amet, tristique blandit nulla. Duis eleifend augue posuere sem molestie sodales. Aenean at molestie nisl. In posuere, risus cursus pulvinar sagittis, tortor turpis viverra purus, pellentesque faucibus turpis dolor quis odio. Quisque dictum enim mi, et volutpat nulla hendrerit at. Duis aliquam purus eu varius tincidunt. Aliquam ut efficitur est. Sed porta et justo vitae luctus. Etiam consequat leo eu porta rhoncus. Maecenas vel metus sit amet elit eleifend suscipit. Suspendisse efficitur, eros vel iaculis tincidunt, est libero cursus nulla, ac viverra mauris enim ac eros. Morbi condimentum tempor ullamcorper. Proin ornare dignissim efficitur. Nulla ac vehicula velit. Morbi mauris turpis, auctor sed justo nec, suscipit dictum mauris. Pellentesque vel metus vel augue finibus gravida. Donec sed lectus ultrices, lobortis nibh a, elementum tellus. Fusce ac quam finibus, imperdiet orci sit amet, semper est. Morbi sit amet mi massa. Mauris quis tincidunt dui, vel efficitur ligula. Integer ac mauris sed justo condimentum tincidunt sit amet eget ante. In vitae rhoncus augue. Nulla et mattis libero. Suspendisse vitae lacus et nulla cursus ultrices. Maecenas ultrices est nec consequat feugiat. Vivamus rutrum velit ac rutrum cursus. Vivamus finibus ut erat eleifend dictum. Quisque interdum velit et justo consectetur, non ornare eros aliquet. Vivamus varius mauris volutpat, blandit dui nec, rutrum ex. Nunc faucibus laoreet velit eu imperdiet. In purus nulla, lobortis at lectus quis, vulputate imperdiet ipsum. Donec quis luctus risus. Quisque eleifend urna id gravida imperdiet. Maecenas eget lectus felis. Aliquam euismod bibendum risus. Vestibulum eget viverra sem. Donec eros justo, sollicitudin condimentum porttitor sit amet, venenatis eget arcu. Aenean lacinia est sed est iaculis mattis. Ut ligula lorem, lobortis quis aliquam at, ultrices at massa. In sit amet magna sit amet justo convallis tristique. Aenean elementum dignissim purus ut dictum. Integer eget fermentum ante. In hac habitasse platea dictumst. Proin vel interdum neque. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Proin consequat fringilla felis et mollis. Aenean metus dui, iaculis cursus feugiat et, placerat vel magna. Ut id dui sed orci sollicitudin suscipit. Vestibulum molestie pretium dui eu lacinia. Aenean diam elit, hendrerit vitae lorem at, cursus elementum nibh. Pellentesque convallis id lorem ac tristique. Morbi sit amet metus hendrerit, dignissim felis id, rutrum sem. Nunc pulvinar tincidunt molestie. Nullam rhoncus, erat quis vehicula rutrum, mauris ex pulvinar lectus, volutpat sollicitudin dolor ligula vitae augue. Quisque sapien nibh, aliquam in hendrerit a, ultricies eget lectus. Nam commodo interdum arcu, quis eleifend metus vulputate ac. Vestibulum ut malesuada odio. Sed in magna sed tellus dictum ultrices. Nam ut leo suscipit, accumsan erat et, molestie velit. Morbi eu dignissim nisl. Donec finibus enim sed sem dictum vestibulum. Aenean tincidunt nisl lacus, ut bibendum lectus bibendum ac. Nulla molestie nisl arcu, eget venenatis urna volutpat malesuada. Aliquam erat volutpat. Nullam tempus nibh in augue lacinia, vel dictum eros tempor. Nunc id urna sit amet quam rutrum tempor sed sed mi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut tellus dignissim, posuere lacus eu, dictum lorem. Pellentesque nulla nulla, euismod at fringilla vel, hendrerit at nibh. Duis euismod pellentesque ex a eleifend. Phasellus in enim in lectus viverra consequat. Donec id tellus vel lorem congue semper. Etiam quis arcu quis dolor tempus ultricies eu non ligula. Cras tristique metus massa, in ornare turpis varius vel. Cras faucibus congue ex sed bibendum. Vestibulum ornare nulla quis venenatis bibendum. Nulla facilisi. Integer sed arcu erat. Phasellus gravida enim vel felis pharetra pretium in luctus diam. Duis eleifend viverra risus et condimentum.Aenean lorem tellus, venenatis a justo non, fermentum faucibus nulla. Nullam at ultrices ante, ut euismod neque. Nulla facilisi. Integer massa enim, fringilla sed pharetra vel, elementum ut purus. Pellentesque eget volutpat enim. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur at tortor id dui condimentum aliquam in et turpis. Integer eu semper lacus. Nulla consequat enim non luctus ultrices. Vivamus porttitor quam et dui placerat condimentum. Donec eleifend velit vitae sapien dictum fermentum. Nulla egestas sem quis sodales pharetra. Maecenas volutpat ligula sem, nec faucibus elit malesuada ac. Morbi purus nisl, aliquet vitae dolor sit amet, tristique blandit nulla. Duis eleifend augue posuere sem molestie sodales. Aenean at molestie nisl. In posuere, risus cursus pulvinar sagittis, tortor turpis viverra purus, pellentesque faucibus turpis dolor quis odio. Quisque dictum enim mi, et volutpat nulla hendrerit at. Duis aliquam purus eu varius tincidunt. Aliquam ut efficitur est. Sed porta et justo vitae luctus. Etiam consequat leo eu porta rhoncus. Maecenas vel metus sit amet elit eleifend suscipit. Suspendisse efficitur, eros vel iaculis tincidunt, est libero cursus nulla, ac viverra mauris enim ac eros. Morbi condimentum tempor ullamcorper. Proin ornare dignissim efficitur. Nulla ac vehicula velit. Morbi mauris turpis, auctor sed justo nec, suscipit dictum mauris. Pellentesque vel metus vel augue finibus gravida. Donec sed lectus ultrices, lobortis nibh a, elementum tellus. Fusce ac quam finibus, imperdiet orci sit amet, semper est. Morbi sit amet mi massa. Mauris quis tincidunt dui, vel efficitur ligula. Integer ac mauris sed justo condimentum tincidunt sit amet eget ante. In vitae rhoncus augue. Nulla et mattis libero. Suspendisse vitae lacus et nulla cursus ultrices. Maecenas ultrices est nec consequat feugiat. Vivamus rutrum velit ac rutrum cursus. Vivamus finibus ut erat eleifend dictum. Quisque interdum velit et justo consectetur, non ornare eros aliquet. Vivamus varius mauris volutpat, blandit dui nec, rutrum ex. Nunc faucibus laoreet velit eu imperdiet. In purus nulla, lobortis at lectus quis, vulputate imperdiet ipsum. Donec quis luctus risus. Quisque eleifend urna id gravida imperdiet. Maecenas eget lectus felis. Aliquam euismod bibendum risus. Vestibulum eget viverra sem. Donec eros justo, sollicitudin condimentum porttitor sit amet, venenatis eget arcu. Aenean lacinia est sed est iaculis mattis. Ut ligula lorem, lobortis quis aliquam at, ultrices at massa. In sit amet magna sit amet justo convallis tristique. Aenean elementum dignissim purus ut dictum. Integer eget fermentum ante. In hac habitasse platea dictumst. Proin vel interdum neque. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Nulla neque leo, sollicitudin ac vehicula sed, gravida vel ipsum. Pellentesque diam nibh, feugiat sed augue a, molestie scelerisque est. Pellentesque id nisi rhoncus, tempus arcu tristique, posuere tellus. Phasellus ac iaculis neque, ac tempor augue. Suspendisse hendrerit odio non nulla tristique aliquet. Fusce cursus gravida posuere. Etiam sollicitudin sem tempus, vestibulum erat sit amet, blandit neque. Cras elit metus, gravida ac commodo id, cursus a dui. Nunc ut velit mi. Vivamus ut diam nec libero euismod scelerisque. Curabitur eget erat nec purus commodo vestibulum sed vitae purus. Morbi id sapien vitae eros dictum aliquam vitae in metus. Proin consequat fringilla felis et mollis. Aenean metus dui, iaculis cursus feugiat et, placerat vel magna. Ut id dui sed orci sollicitudin suscipit. Vestibulum molestie pretium dui eu lacinia. Aenean diam elit, hendrerit vitae lorem at, cursus elementum nibh. Pellentesque convallis id lorem ac tristique. Morbi sit amet metus hendrerit, dignissim felis id, rutrum sem. Nunc pulvinar tincidunt molestie. Nullam rhoncus, erat quis vehicula rutrum, mauris ex pulvinar lectus, volutpat sollicitudin dolor ligula vitae augue. Quisque sapien nibh, aliquam in hendrerit a, ultricies eget lectus. Nam commodo interdum arcu, quis eleifend metus vulputate ac. Vestibulum ut malesuada odio. Sed in magna sed tellus dictum ultrices. Nam ut leo suscipit, accumsan erat et, molestie velit. Morbi eu dignissim nisl. Donec finibus enim sed sem dictum vestibulum. Aenean tincidunt nisl lacus, ut bibendum lectus bibendum ac. Nulla molestie nisl arcu, eget venenatis urna volutpat malesuada. Aliquam erat volutpat. Nullam tempus nibh in augue lacinia, vel dictum eros tempor. Nunc id urna sit amet quam rutrum tempor sed sed mi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut tellus dignissim, posuere lacus eu, dictum lorem. Pellentesque nulla nulla, euismod at fringilla vel, hendrerit at nibh. Duis euismod pellentesque ex a eleifend. Phasellus in enim in lectus viverra consequat. Donec id tellus vel lorem congue semper. Etiam quis arcu quis dolor tempus ultricies eu non ligula. Cras tristique metus massa, in ornare turpis varius vel. Cras faucibus congue ex sed bibendum. Vestibulum ornare nulla quis venenatis bibendum. Nulla facilisi. Integer sed arcu erat. Phasellus gravida enim vel felis pharetra pretium in luctus diam. Duis eleifend viverra risus et condimentum.Aenean lorem tellus, venenatis a justo non, fermentum faucibus nulla. Nullam at ultrices ante, ut euismod neque. Nulla facilisi. Integer massa enim, fringilla sed pharetra vel, elementum ut purus. Pellentesque eget volutpat enim. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur at tortor id dui condimentum aliquam in et turpis. Integer eu semper lacus. Nulla consequat enim non luctus ultrices. Vivamus porttitor quam et dui placerat condimentum. Donec eleifend velit vitae sapien dictum fermentum. Nulla egestas sem quis sodales pharetra. Maecenas volutpat ligula sem, nec faucibus elit malesuada ac. Morbi purus nisl, aliquet vitae dolor sit amet, tristique blandit nulla. Duis eleifend augue posuere sem molestie sodales. Aenean at molestie nisl. In posuere, risus cursus pulvinar sagittis, tortor turpis viverra purus, pellentesque faucibus turpis dolor quis odio. Quisque dictum enim mi, et volutpat nulla hendrerit at. Duis aliquam purus eu varius tincidunt. Aliquam ut efficitur est. Sed porta et justo vitae luctus. Etiam consequat leo eu porta rhoncus. Maecenas vel metus sit amet elit eleifend suscipit. Suspendisse efficitur, eros vel iaculis tincidunt, est libero cursus nulla, ac viverra mauris enim ac eros. Morbi condimentum tempor ullamcorper. Proin ornare dignissim efficitur. Nulla ac vehicula velit. Morbi mauris turpis, auctor sed justo nec, suscipit dictum mauris. Pellentesque vel metus vel augue finibus gravida. Donec sed lectus ultrices, lobortis nibh a, elementum tellus. Fusce ac quam finibus, imperdiet orci sit amet, semper est.'

describe('utils-crypto', () => {
  describe('box', () => {
    it('createBoxKeyPair() creates a KeyPair for encryption', () => {
      const kp = createBoxKeyPair()
      expect(Buffer.isBuffer(kp.publicKey)).toBe(true)
      expect(Buffer.isBuffer(kp.secretKey)).toBe(true)
      expect(kp.publicKey).toHaveLength(BOX_PUBLICKEYBYTES)
      expect(kp.secretKey).toHaveLength(BOX_SECRETKEYBYTES)
    })

    it('createBoxKeyPair() accepts a seed', () => {
      const seed = Buffer.alloc(BOX_SEEDBYTES, 'a')
      const kp1 = createBoxKeyPair(seed)
      const kp2 = createBoxKeyPair(seed)
      expect(kp1.publicKey.equals(kp2.publicKey)).toBe(true)
      expect(kp1.secretKey.equals(kp2.secretKey)).toBe(true)

      const otherSeed = Buffer.alloc(BOX_SEEDBYTES, 'b')
      const kp3 = createBoxKeyPair(otherSeed)
      expect(kp1.publicKey.equals(kp3.publicKey)).toBe(false)
      expect(kp1.secretKey.equals(kp3.secretKey)).toBe(false)
    })

    it('createBoxKeyPair() throws if the provided seed is too short', () => {
      const seed = Buffer.alloc(BOX_SEEDBYTES - 1)
      expect(() => createBoxKeyPair(seed)).toThrow(
        `Invalid seed, must be at least ${BOX_SEEDBYTES} bytes long`,
      )
    })

    it('createBoxPublicFromSign() creates an encryption public key from a signing one', () => {
      const kp = createSignKeyPair()
      const pubKey = createBoxPublicFromSign(kp.publicKey)
      expect(pubKey).toHaveLength(BOX_PUBLICKEYBYTES)
    })

    it('createBoxKeyPairFromSign() creates an encryption KeyPair from a signing one', () => {
      const kp = createBoxKeyPairFromSign(createSignKeyPair())
      expect(kp.publicKey).toHaveLength(BOX_PUBLICKEYBYTES)
      expect(kp.secretKey).toHaveLength(BOX_SECRETKEYBYTES)
    })

    it('provides encryptBox() and decryptBox()', () => {
      const message = Buffer.from('test')
      const fromKP = createBoxKeyPair()
      const toKP = createBoxKeyPair()
      const otherKP = createBoxKeyPair()

      const encrypted = encryptBox(message, toKP.publicKey, fromKP.secretKey)
      const decrypted = decryptBox(encrypted, fromKP.publicKey, toKP.secretKey)
      expect(message.equals(decrypted)).toBe(true)

      const notDecrypted = decryptBox(
        encrypted,
        fromKP.publicKey,
        otherKP.secretKey,
      )
      expect(notDecrypted).toBeNull()
    })
  })

  describe('secret box', () => {
    it('createSecretBoxKey() creates a random secret box key', () => {
      const key = createSecretBoxKey()
      expect(key).toHaveLength(SECRETBOX_KEYBYTES)
      const otherKey = createSecretBoxKey()
      expect(key.equals(otherKey)).toBe(false)
    })

    it('createSecretBoxKeyFromPassword() creates a secret box key from a password', async () => {
      const createKey = (pwd, slt) => {
        // Use minimum opslimit and memlimit to make test fast
        return createSecretBoxKeyFromPassword(
          pwd,
          slt,
          PASSWORDHASH_OPSLIMIT_MIN,
          PASSWORDHASH_MEMLIMIT_MIN,
        )
      }

      const password = Buffer.from('not so secure')
      const salt = createPasswordHashSalt()
      const otherSalt = createPasswordHashSalt()

      const [
        ref,
        samePasswordAndKey,
        samePasswordOtherSalt,
        otherPasswordSameSalt,
      ] = await Promise.all([
        createKey(password, salt),
        createKey(password, salt),
        createKey(password, otherSalt),
        createKey(Buffer.from('not so secure either'), salt),
      ])
      expect(ref).toHaveLength(SECRETBOX_KEYBYTES)
      expect(ref.equals(samePasswordAndKey)).toBe(true)
      expect(ref.equals(samePasswordOtherSalt)).toBe(false)
      expect(ref.equals(otherPasswordSameSalt)).toBe(false)
    })

    it('provides encryptSecretBox() and decryptSecretBox()', () => {
      const key = createSecretBoxKey()
      const message = Buffer.from('test message')

      const encrypted = encryptSecretBox(message, key)
      expect(Buffer.isBuffer(encrypted.cipher)).toBe(true)
      expect(Buffer.isBuffer(encrypted.nonce)).toBe(true)
      expect(encrypted.nonce).toHaveLength(SECRETBOX_NONCEBYTES)

      const decrypted = decryptSecretBox(encrypted, key)
      expect(message.equals(decrypted)).toBe(true)

      const notDecrypted = decryptSecretBox(encrypted, createSecretBoxKey())
      expect(notDecrypted).toBeNull()
    })
  })

  describe('hash', () => {
    it('hash() the provided input', () => {
      const hashed = hash(Buffer.from('data to hash'), GENERICHASH_BYTES_MIN)
      expect(hashed).toHaveLength(GENERICHASH_BYTES_MIN)
    })

    it('hashStream() returns a promise of the hash after the stream is read until the end', async () => {
      const stream = toStream('here are the stream contents', 4)
      const hashed = await hashStream(stream)
      expect(hashed).toHaveLength(GENERICHASH_BYTES)
    })
  })

  describe('password', () => {
    it('createPasswordHashSalt() returns a Buffer to use as password salt', () => {
      const salt = createPasswordHashSalt()
      expect(Buffer.isBuffer(salt)).toBe(true)
      expect(salt).toHaveLength(PASSWORDHASH_SALTBYTES)
      expect(salt.equals(createPasswordHashSalt())).toBe(false)
    })

    it('hashPassword() hashed a password into the provided buffer', async () => {
      jest.setTimeout(10000)
      const hash = Buffer.allocUnsafe(24) // Will be mutated
      const hashClone = Buffer.from(hash)
      expect(hash.equals(hashClone)).toBe(true)

      await hashPassword(
        hash,
        Buffer.from('my password'),
        createPasswordHashSalt(),
      )
      expect(hash.equals(hashClone)).toBe(false)
    })
  })

  describe('random', () => {
    it('randomBytes() returns a buffer with random data', () => {
      const buf = randomBytes(24)
      expect(Buffer.isBuffer(buf)).toBe(true)
      expect(buf).toHaveLength(24)
      expect(buf.equals(randomBytes(24))).toBe(false)
    })

    it('secureRandomBytes() returns a buffer with random data', () => {
      const buf = secureRandomBytes(24)
      expect(Buffer.isBuffer(buf)).toBe(true)
      expect(buf).toHaveLength(24)
      expect(buf.equals(secureRandomBytes(24))).toBe(false)
    })
  })

  describe('sign', () => {
    it('createSignKeyPair() creates a KeyPair for signing', () => {
      const kp = createSignKeyPair()
      expect(Buffer.isBuffer(kp.publicKey)).toBe(true)
      expect(Buffer.isBuffer(kp.secretKey)).toBe(true)
      expect(kp.publicKey).toHaveLength(SIGN_PUBLICKEYBYTES)
      expect(kp.secretKey).toHaveLength(SIGN_SECRETKEYBYTES)
    })

    it('createSignKeyPair() accepts a seed', () => {
      const seed = Buffer.alloc(SIGN_SEEDBYTES, 'a')
      const kp1 = createSignKeyPair(seed)
      const kp2 = createSignKeyPair(seed)
      expect(kp1.publicKey.equals(kp2.publicKey)).toBe(true)
      expect(kp1.secretKey.equals(kp2.secretKey)).toBe(true)

      const otherSeed = Buffer.alloc(SIGN_SEEDBYTES, 'b')
      const kp3 = createSignKeyPair(otherSeed)
      expect(kp1.publicKey.equals(kp3.publicKey)).toBe(false)
      expect(kp1.secretKey.equals(kp3.secretKey)).toBe(false)
    })

    it('createSignKeyPair() throws if the provided seed is too short', () => {
      const seed = Buffer.alloc(SIGN_SEEDBYTES - 1)
      expect(() => createSignKeyPair(seed)).toThrow(
        `Invalid seed, must be at least ${SIGN_SEEDBYTES} bytes long`,
      )
    })

    it('provides getSignature() and verifySignature() for detached signatures', () => {
      const kp = createSignKeyPair()
      const message = Buffer.from('message to sign')

      const signature = getSignature(message, kp.secretKey)
      expect(Buffer.isBuffer(signature)).toBe(true)
      expect(signature).toHaveLength(SIGN_BYTES)

      const valid = verifySignature(message, signature, kp.publicKey)
      expect(valid).toBe(true)

      const otherKP = createSignKeyPair()
      const invalid = verifySignature(message, signature, otherKP.publicKey)
      expect(invalid).toBe(false)
    })

    it('provides sign() and openSigned()', () => {
      const kp = createSignKeyPair()
      const message = Buffer.from('message to sign')

      const signed = sign(message, kp.secretKey)
      expect(Buffer.isBuffer(signed)).toBe(true)

      const verified = openSigned(signed, kp.publicKey)
      expect(message.equals(verified)).toBe(true)

      const otherKP = createSignKeyPair()
      const invalid = openSigned(signed, otherKP.publicKey)
      expect(invalid).toBeNull()
    })
  })

  describe('stream', () => {
    it('provides createSecretStreamKey()', () => {
      const key = createSecretStreamKey()
      expect(Buffer.isBuffer(key)).toBe(true)
      expect(key.length).toBe(SECRETSTREAM_KEYBYTES)
    })

    it('encodes and decodes a stream of a single chunk', async () => {
      const key = createSecretStreamKey()
      const message = Buffer.from('test')

      const encryptedSink = new StreamToBuffer()
      const decryptedSink = new StreamToBuffer()

      await asyncPipeline(
        new BufferToStream(message),
        createEncryptStream(key),
        encryptedSink,
      )
      expect(encryptedSink.buffer.equals(message)).toBe(false)

      await asyncPipeline(
        new BufferToStream(encryptedSink.buffer),
        createDecryptStream(key),
        decryptedSink,
      )

      expect(decryptedSink.buffer.equals(message)).toBe(true)
    })

    it('encodes and decodes a stream of multiple chunks', async () => {
      const key = createSecretStreamKey()
      const message = Buffer.from(LOREM_IPSUM).slice(
        0,
        SECRETSTREAM_CHUNKBYTES_PLAINTEXT,
      )
      const sink = new StreamToBuffer()

      await asyncPipeline(
        new BufferToStream(message),
        createEncryptStream(key),
        createDecryptStream(key),
        sink,
      )

      expect(sink.buffer.equals(message)).toBe(true)
    })

    it('encodes and decodes a stream of the exact chunk size', async () => {
      const key = createSecretStreamKey()
      const message = Buffer.from(LOREM_IPSUM).slice(
        0,
        SECRETSTREAM_CHUNKBYTES_PLAINTEXT,
      )
      const sink = new StreamToBuffer()

      await asyncPipeline(
        new BufferToStream(message),
        createEncryptStream(key),
        createDecryptStream(key),
        sink,
      )

      expect(sink.buffer.equals(message)).toBe(true)
    })
  })

  describe('advanced flows', () => {
    it('converts signature keys and encrypts messages', () => {
      const aliceSignKP = createSignKeyPair()
      const bobSignKP = createSignKeyPair()
      // Alice and Bob create encryption secret keys from their own signature keys
      const aliceSecretKey = createBoxKeyPairFromSign(aliceSignKP).secretKey
      const bobSecretKey = createBoxKeyPairFromSign(bobSignKP).secretKey
      // Alice and Bob can derive each other's public encryption key based on the signature key
      const aliceToBobKey = createBoxPublicFromSign(bobSignKP.publicKey)
      const bobFromAliceKey = createBoxPublicFromSign(aliceSignKP.publicKey)
      // Message encryption and decryption flow
      const message = Buffer.from('hello')
      const encrypted = encryptBox(message, aliceToBobKey, aliceSecretKey)
      const decrypted = decryptBox(encrypted, bobFromAliceKey, bobSecretKey)
      expect(message.equals(decrypted)).toBe(true)
    })
  })
})
