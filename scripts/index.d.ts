/// <reference types="socket.io-client" />
/// <reference types="jquery" />

interface NexusFrameworkResource {
    name: string;
    type: string;
    source: string;
    inline?: boolean;
    integrity?: string;
    dependencies: string[];
}
declare interface NexusFrameworkLoader {
    load(data: any, cb: (err?: Error) => void): void;
    /**
     * Loads a resource.
     * Downloads the file asynchroniously and reads any header for @ tags.
     * After that, queues it for download, and returns an info object for the script when complete.
     * 
     * @param type The type, script or style
     * @param name The name of the resource
     * @param source The source of the resource
     * @param cb The callback
     * @param deps The dependencies
     * @param inlineOrVersion True or String, inline or version.
     */
    loadResource(type: string, script: string, cb?: (err?: Error) => void, deps?: string[], inlineOrIntegrity?: boolean | string, name?: string): void;
    /**
     * Queries the list of requested resources.
     * Each resource is listed as `type:name`.
     */
    requestedResources(): string[];
}
declare interface NexusFrameworkTransportResponse {
    /**
     * The response url.
     */
    readonly url: string;
    /**
     * The response code;
     */
    readonly code: number;
    /**
     * Parses a JSON representation from the response string or throws an error.
     */
    readonly contentFromJSON: any;
    /**
     * The content as a ArrayBuffer.
     */
    readonly contentAsArrayBuffer: any;
    /**
     * The content as a String.
     */
    readonly contentAsString: string;
    /**
     * A map of response headers, each header can occur more than once.
     */
    readonly headers: {[index: string]: string[]};
}
declare interface NexusFrameworkPageSystemResponse {
    data: any;
    code: number;
    headers: {[index: string]: string[]};
}
declare interface NexusFrameworkPageSystemOptions {
    /**
     * Override the built in way of handling page responses.
     * 
     * @returns True when handled correctly, false to reload the page to the request url.
     */
    handler?: (res: NexusFrameworkTransportResponse) => boolean;
    /**
     * Method to call before attempting to make a page request.
     * 
     * @returns True to continue, False to abort.
     */
    prerequest?: (path: string) => boolean;
    /**
     * Disables using the loader-progress elements.
     */
    noprogress?: boolean;
    /**
     * Disables using SocketIO, which would be used otherwise, when available
     */
    noio?: boolean;
}
declare interface NexusFrameworkComponent {
    create(element: HTMLElement): void;
    destroy(): void;
    
    restore(data: any): void;
    save(): any;
}
declare interface NexusFrameworkComponentFactory {
    new (): NexusFrameworkComponent;
}
declare interface NexusFrameworkAnalyticsAdapter {
    reportError(err: Error): void;
    reportPage(path?: string): void;
    reportEvent(category: string, action: string, label?: string, value?: number): void;
}
declare interface NexusFrameworkClient {
    /**
     * The Socket.IO instance, if enabled and available.
     */
    readonly io: SocketIOClient.Socket;
    /**
     * The base URL for this client.
     */
    readonly url: string;
    /**
     * The analytics adapter.
     */
    analytics: NexusFrameworkAnalyticsAdapter;
    
    /**
     * Initialize the page system.
     */
    initPageSystem(opts?: NexusFrameworkPageSystemOptions): void;
    /**
     * Loads a page, relative to the root URL for the website.
     */
    requestPage(path: string, post?: any): void;
    
    /**
     * Register a component by selector.
     */
    registerComponent(selector: string, impl: NexusFrameworkComponentFactory): void;
    /**
     * Unregister a component by selector.
     */
    unregisterComponent(selector: string, impl: NexusFrameworkComponentFactory): void;
    /**
     * Initialize and create all components within root
     */
    createComponents(root: HTMLElement): void;
    /**
     * Destroy all components within root
     */
    destroyComponents(root: HTMLElement): void;
    /**
     * Save components in root into a state object
     */
    saveComponents(root: HTMLElement): Object;
    /**
     * Restore components in root from a state object
     */
    restoreComponents(root: HTMLElement, state: Object): void;
    
    /**
     * Disable an element and its children.
     * 
     * @param root The root element, by default document.body
     */
    disableAll(root?: HTMLElement): void;
    /**
     * Enable an element and its children.
     * 
     * @param root The root element, by default document.body
     */
    enableAll(root?: HTMLElement): void;
    
    /**
     * Add an event listener for when pages are loaded via the dynamic page system.
     */
    on(event: "page", cb: (path: string) => void): void;
    /**
     * Add an event listener for a specific event.
     */
    on(event: string, cb: (...args: any[]) => void): void;
    /**
     * Remove a event listener for when pages are loaded via the dynamic page system.
     */
    off(event: "page", cb: (path: string) => void): void;
    /**
     * Remove n event listener for a specific event.
     */
    off(event: string, cb: (...args: any[]) => void): void;
    /**
     * Remove a event listener for when pages are loaded via the dynamic page system.
     */
    emit(event: string, ...args: any[]): void;
}
declare interface NexusFrameworkTransport {
    get(url: string, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void): void;
    head(url: string, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void): void;
    put(url: string, data: any, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void): void;
    post(url: string, data: any, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void): void;
    execute(method: string, url: string, data: any, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void): void;
    del(url: string, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void): void;
}
declare interface GoogleAnalytics {
    (cmd: string, ...args: any[]): void;
}
declare interface Window {
    NexusFrameworkImpl?: any;
    NexusFrameworkLoader?: NexusFrameworkLoader;
    NexusFrameworkTransport?: NexusFrameworkTransport;
    NexusFramework?: NexusFrameworkClient;
    io?: SocketIOClientStatic;
    jQuery?: JQueryStatic;
    ga?: GoogleAnalytics;
}