const net = require("net");

function cstring(value) {
  return Buffer.from(`${value}\0`, "utf8");
}

function int32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeInt32LE(value);
  return buffer;
}

function double(value) {
  const buffer = Buffer.alloc(8);
  buffer.writeDoubleLE(value);
  return buffer;
}

function bsonString(value) {
  const text = Buffer.from(`${value}\0`, "utf8");
  return Buffer.concat([int32(text.length), text]);
}

function bsonDocument(document) {
  const elements = [];

  for (const [key, value] of Object.entries(document)) {
    if (typeof value === "string") {
      elements.push(Buffer.concat([Buffer.from([0x02]), cstring(key), bsonString(value)]));
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        elements.push(Buffer.concat([Buffer.from([0x10]), cstring(key), int32(value)]));
      } else {
        elements.push(Buffer.concat([Buffer.from([0x01]), cstring(key), double(value)]));
      }
    } else if (typeof value === "boolean") {
      elements.push(Buffer.concat([Buffer.from([0x08]), cstring(key), Buffer.from([value ? 1 : 0])]));
    } else if (Array.isArray(value)) {
      const arrayDoc = {};
      value.forEach((item, index) => {
        arrayDoc[String(index)] = item;
      });
      elements.push(Buffer.concat([Buffer.from([0x04]), cstring(key), bsonDocument(arrayDoc)]));
    } else if (value && typeof value === "object") {
      elements.push(Buffer.concat([Buffer.from([0x03]), cstring(key), bsonDocument(value)]));
    } else if (value === null) {
      elements.push(Buffer.concat([Buffer.from([0x0a]), cstring(key)]));
    } else {
      throw new Error(`Unsupported BSON value for ${key}`);
    }
  }

  const body = Buffer.concat(elements);
  return Buffer.concat([int32(body.length + 5), body, Buffer.from([0])]);
}

function readCString(buffer, offset) {
  let end = offset;
  while (buffer[end] !== 0) end++;
  return {
    value: buffer.toString("utf8", offset, end),
    offset: end + 1,
  };
}

function parseBson(buffer, offset = 0) {
  const size = buffer.readInt32LE(offset);
  const end = offset + size - 1;
  const result = {};
  let cursor = offset + 4;

  while (cursor < end) {
    const type = buffer[cursor++];
    const key = readCString(buffer, cursor);
    cursor = key.offset;

    if (type === 0x01) {
      result[key.value] = buffer.readDoubleLE(cursor);
      cursor += 8;
    } else if (type === 0x02) {
      const length = buffer.readInt32LE(cursor);
      cursor += 4;
      result[key.value] = buffer.toString("utf8", cursor, cursor + length - 1);
      cursor += length;
    } else if (type === 0x03 || type === 0x04) {
      const parsed = parseBson(buffer, cursor);
      result[key.value] = parsed.value;
      cursor = parsed.offset;
    } else if (type === 0x08) {
      result[key.value] = buffer[cursor] === 1;
      cursor += 1;
    } else if (type === 0x09) {
      result[key.value] = new Date(Number(buffer.readBigInt64LE(cursor))).toISOString();
      cursor += 8;
    } else if (type === 0x10) {
      result[key.value] = buffer.readInt32LE(cursor);
      cursor += 4;
    } else if (type === 0x11) {
      result[key.value] = {
        increment: buffer.readUInt32LE(cursor),
        timestamp: buffer.readUInt32LE(cursor + 4),
      };
      cursor += 8;
    } else if (type === 0x12) {
      result[key.value] = Number(buffer.readBigInt64LE(cursor));
      cursor += 8;
    } else if (type === 0x07) {
      result[key.value] = buffer.subarray(cursor, cursor + 12).toString("hex");
      cursor += 12;
    } else if (type === 0x05) {
      const length = buffer.readInt32LE(cursor);
      const subtype = buffer[cursor + 4];
      cursor += 5;
      result[key.value] = { subtype, length };
      cursor += length;
    } else if (type === 0x0a) {
      result[key.value] = null;
    } else {
      throw new Error(`Unsupported BSON response type 0x${type.toString(16)} for ${key.value}`);
    }
  }

  return { value: result, offset: offset + size };
}

function buildMessage(command) {
  const requestId = Math.floor(Math.random() * 1_000_000);
  const flags = int32(0);
  const sectionKind = Buffer.from([0]);
  const doc = bsonDocument(command);
  const body = Buffer.concat([flags, sectionKind, doc]);
  const header = Buffer.alloc(16);
  header.writeInt32LE(16 + body.length, 0);
  header.writeInt32LE(requestId, 4);
  header.writeInt32LE(0, 8);
  header.writeInt32LE(2013, 12);
  return Buffer.concat([header, body]);
}

function sendCommand(command) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: 27018 });
    const chunks = [];

    socket.on("connect", () => {
      socket.write(buildMessage(command));
    });

    socket.on("data", (chunk) => {
      chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      if (buffer.length >= 4 && buffer.length >= buffer.readInt32LE(0)) {
        socket.end();
        const flagsAndKindOffset = 16 + 4 + 1;
        resolve(parseBson(buffer, flagsAndKindOffset).value);
      }
    });

    socket.on("error", reject);
    socket.setTimeout(15000, () => {
      socket.destroy();
      reject(new Error("Timed out waiting for MongoDB response"));
    });
  });
}

async function main() {
  const command = process.argv[2] === "status"
    ? { replSetGetStatus: 1, $db: "admin" }
    : {
        replSetInitiate: {
          _id: "rs0",
          members: [{ _id: 0, host: "localhost:27018" }],
        },
        $db: "admin",
      };

  const result = await sendCommand(command);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
