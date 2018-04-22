export declare function getStoragePath(): string;
export declare function setStoragePath(dir: string): void;
export declare function get(key: string): Promise<object>;
export declare function set(key: string, data: object): Promise<object>;
export declare function has(key: string): boolean;
export declare function keys(): Promise<string[]>;
export declare function remove(key: string): Promise<void>;
export declare function clear(): Promise<void[]>;
