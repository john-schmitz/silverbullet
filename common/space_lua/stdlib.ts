import {
    LuaBuiltinFunction,
    LuaEnv,
    LuaMultiRes,
    LuaNativeJSFunction,
    type LuaTable,
    luaTypeOf,
} from "$common/space_lua/runtime.ts";

const printFunction = new LuaNativeJSFunction((...args) => {
    console.log("[Lua]", ...args);
});

const assertFunction = new LuaNativeJSFunction(
    (value: any, message?: string) => {
        if (!value) {
            throw new Error(`Assertion failed: ${message}`);
        }
    },
);

const ipairsFunction = new LuaNativeJSFunction((ar: any[]) => {
    let i = 0;
    return () => {
        if (i >= ar.length) {
            return;
        }
        const result = new LuaMultiRes([i, ar[i]]);
        i++;
        return result;
    };
});

const pairsFunction = new LuaBuiltinFunction((t: LuaTable) => {
    const keys = t.keys();
    let i = 0;
    return () => {
        if (i >= keys.length) {
            return;
        }
        const key = keys[i];
        const result = new LuaMultiRes([key, t.get(key)]);
        i++;
        return result;
    };
});

const typeFunction = new LuaNativeJSFunction((value: any) => {
    return luaTypeOf(value);
});

const tostringFunction = new LuaNativeJSFunction((value: any) => {
    return String(value);
});

const tonumberFunction = new LuaNativeJSFunction((value: any) => {
    return Number(value);
});

const errorFunction = new LuaNativeJSFunction((message: string) => {
    throw new Error(message);
});

export function luaBuildStandardEnv() {
    const env = new LuaEnv();
    env.set("print", printFunction);
    env.set("assert", assertFunction);
    env.set("pairs", pairsFunction);
    env.set("ipairs", ipairsFunction);
    env.set("type", typeFunction);
    env.set("tostring", tostringFunction);
    env.set("tonumber", tonumberFunction);
    env.set("error", errorFunction);
    return env;
}
