/**
 * 简单 ZIP 生成器（用于 DOCX 导出）
 * 移植自 src/composables/useExport.ts 中的 SimpleZip 类
 */

class ZipFile {
  name: string = ''
  data: ArrayBuffer = new ArrayBuffer(0)

  constructor(name: string, data: ArrayBuffer) {
    this.name = name
    this.data = data
  }
}

export class SimpleZip {
  private files: ZipFile[] = []

  add(name: string, content: string | ArrayBuffer): void {
    if (typeof content === 'string') {
      // 将字符串转为 ArrayBuffer
      const encoder = new util.TextEncoder()
      const encoded = encoder.encodeInto(content)
      this.files.push(new ZipFile(name, encoded.buffer))
    } else {
      this.files.push(new ZipFile(name, content))
    }
  }

  generate(): ArrayBuffer {
    const encoder = new util.TextEncoder()
    let offset = 0

    const localHeaders: ArrayBuffer[] = []
    const centralDir: ArrayBuffer[] = []

    for (const file of this.files) {
      const nameBytes = encoder.encodeInto(file.name)
      const crc = this.crc32(file.data)

      // 本地文件头
      const local = new ArrayBuffer(30 + nameBytes.byteLength)
      const lv = new DataView(local)
      lv.setUint32(0, 0x04034b50, true) // signature
      lv.setUint16(4, 20, true) // version needed
      lv.setUint16(6, 0, true) // flags
      lv.setUint16(8, 0, true) // compression (stored)
      lv.setUint16(10, 0, true) // mod time
      lv.setUint16(12, 0, true) // mod date
      lv.setUint32(14, crc, true) // crc32
      lv.setUint32(18, file.data.byteLength, true) // compressed size
      lv.setUint32(22, file.data.byteLength, true) // uncompressed size
      lv.setUint16(26, nameBytes.byteLength, true) // name length
      lv.setUint16(28, 0, true) // extra length

      // 复制文件名到本地头
      const localArr = new Uint8Array(local)
      const nameArr = new Uint8Array(nameBytes.buffer ? nameBytes.buffer : new ArrayBuffer(0))
      for (let i = 0; i < nameBytes.byteLength; i++) {
        localArr[30 + i] = nameArr[i]
      }

      localHeaders.push(local)
      localHeaders.push(file.data)

      // 中央目录
      const central = new ArrayBuffer(46 + nameBytes.byteLength)
      const cv = new DataView(central)
      cv.setUint32(0, 0x02014b50, true) // signature
      cv.setUint16(4, 20, true) // version made by
      cv.setUint16(6, 20, true) // version needed
      cv.setUint16(8, 0, true) // flags
      cv.setUint16(10, 0, true) // compression
      cv.setUint16(12, 0, true) // mod time
      cv.setUint16(14, 0, true) // mod date
      cv.setUint32(16, crc, true) // crc32
      cv.setUint32(20, file.data.byteLength, true) // compressed size
      cv.setUint32(24, file.data.byteLength, true) // uncompressed size
      cv.setUint16(28, nameBytes.byteLength, true) // name length
      cv.setUint16(30, 0, true) // extra length
      cv.setUint16(32, 0, true) // comment length
      cv.setUint16(34, 0, true) // disk number
      cv.setUint16(36, 0, true) // internal attrs
      cv.setUint32(38, 0, true) // external attrs
      cv.setUint32(42, offset, true) // local header offset

      const centralArr = new Uint8Array(central)
      for (let i = 0; i < nameBytes.byteLength; i++) {
        centralArr[46 + i] = nameArr[i]
      }

      centralDir.push(central)
      offset += 30 + nameBytes.byteLength + file.data.byteLength
    }

    const centralDirOffset = offset
    let centralDirSize = 0
    for (const cd of centralDir) {
      centralDirSize += cd.byteLength
    }

    // End of central directory
    const eocd = new ArrayBuffer(22)
    const ev = new DataView(eocd)
    ev.setUint32(0, 0x06054b50, true)
    ev.setUint16(4, 0, true)
    ev.setUint16(6, 0, true)
    ev.setUint16(8, this.files.length, true)
    ev.setUint16(10, this.files.length, true)
    ev.setUint32(12, centralDirSize, true)
    ev.setUint32(16, centralDirOffset, true)
    ev.setUint16(20, 0, true)

    // 合并所有部分
    const totalSize = offset + centralDirSize + 22
    const result = new ArrayBuffer(totalSize)
    const resultArr = new Uint8Array(result)
    let pos = 0
    for (const h of localHeaders) {
      resultArr.set(new Uint8Array(h), pos)
      pos += h.byteLength
    }
    for (const cd of centralDir) {
      resultArr.set(new Uint8Array(cd), pos)
      pos += cd.byteLength
    }
    resultArr.set(new Uint8Array(eocd), pos)

    return result
  }

  private crc32(data: ArrayBuffer): number {
    const bytes = new Uint8Array(data)
    let crc = 0xffffffff
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i]
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
      }
    }
    return (crc ^ 0xffffffff) >>> 0
  }
}
