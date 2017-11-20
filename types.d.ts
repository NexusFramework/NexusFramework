import { NexusFramework } from "./src/nexusframework";
import { nexusfork } from "nexusfork/types";

import { Template } from "nhp/lib/Template";

import { Agent, Details } from "useragent";

declare module nexusframework {
    const enum BodyProcessor {
        URLEncoded,
        MultipartFormData,
        JSONBody
    }
    export interface User {
        isAdmin?: boolean;
        isEditor?: boolean;
        isModerator?: boolean;
        
        id?: string | number;
        displayName?: string;
        email?: string;
        
        resolveAvatar?(size: number, cb: (err: Error, avatarUrl?: string) => void): void;
        
        [key: string]: any;
    }
    export interface PageSystemSkeleton {
        (template: string, options: any, req: Request, res: Response, next: (err: Error, data?: any) => void): void;
    }
    export interface Request extends nexusfork.WebRequest {
        /**
         * The user, if any;
         */
         user?: User;
        /**
         * Information about the seragent of the request.
         * Provided by seragent.
         */
        useragent?: Agent & Details & {es6?: boolean, legacy?: boolean};
        /**
         * The current NHP skeleton.
         */
        skeleton?: Template;
        /**
         * The current legacy NHP skeleton.
         */
        legacyskeleton?: Template;
        pagesysskeleton?: PageSystemSkeleton;
        /**
         * The NexusFramework instance.
         */
        nexusframework?: NexusFramework;
        /**
         * The request handler mapping.
         */
        mapping?: RequestHandlerMethodExtendedMapping;
        /**
         * An array of all the RegExp matches while processing the request.
         */
        matches?: RegExpMatchArray[];
        /**
         * The current RegExp match while procesing the request.
         */
        match?: RegExpMatchArray;
        /**
         * Requested through the Page System API.
         */
        pagesys?: boolean;
        /**
         * The associated Socket.IO Socket, if requested through the page API.
         */
        io?: SocketIO.Socket;
        /**
         * True if this request is either .xhr or .io.
         */
        xhrOrIO?: boolean;
        /**
         * Process the request body.
         * By default all processors are usable, and the processor chosen is determined by the request content-type header.
         */
        processBody(cb: (err?: Error) => void, ...processors: BodyProcessor[]): Request;
        readBody(cb: (err: Error, data?: string) => void, limit?: number): void;
    }
    export interface Renderer {
        (out: {write: (data: string) => void},flush?:() => void): void
    }
    export interface Response extends nexusfork.WebResponse {
        /**
         * Render a page using a template engine and serve it.
         * This method will use the skeleton if available, `render` will not.
         * 
         * @param filename The absolute path to a file to render, or template source
         * @param options The variables to use for rendering
         */
        sendRender(filename: string, options?: any): Response;
        
        /**
         * Enable the NexusFramework Loader to the script queue, and defer all scripts and styles,
         * as well as display a configurable loading screen.
         */
        enableLoader(): void;
        
        /**
         * Set a meta tag in the header html.
         */
        setMetaTag(name: string, value: string): void;
        /**
         * Add a style to the style queue.
         */
        addStyle(url: string, version?: string, ...deps: string[]): void;
        addInlineStyle(source: string, ...deps: string[]): void;
        /**
         * Add a renderer to the header.
         */
        addHeaderRenderer(renderer: Renderer | string): void;
        
        /**
         * Add a name to the body's classes.
         */
        addBodyClassName(name: string): void;
        /**
         * Remove a name to the body's classes.
         */
        removeBodyClassName(name: string): void;
        /**
         * Add a renderer after the body.
         */
        addAfterBodyRenderer(renderer: Renderer | string): void;
        
        /**
         * Add a google font, with the specified weight.
         * 
         * @param family The font family.
         * @param weight The font weight.
         * @param italic Italic
         */
        addGoogleFont(family: string, weight?: number, italic?: boolean): void;
        /**
         * Add a renderer to the footer.
         */
        addFooterRenderer(renderer: Renderer | string): void;
        /**
         * Add a script to the script queue.
         */
        addScript(url: string, version?: string, ...deps: string[]): void;
        addInlineScript(source: string, ...deps: string[]): void;
        /**
         * Add the Socket.IO Client to the script queue.
         */
        addSocketIOClient(): void;
        /**
         * Add the NexusFramework Client to the script queue.
         */
        addNexusFrameworkClient(includeSocketIO?: boolean): void;
        
        /**
         * Write the header html to the stream.
         * Try to position this just before the ending </head> tag.
         */
        writeHeaderHtml(out?: NodeJS.WritableStream): void;
        /**
         * Write the after body html to the stream.
         * Try to position this just after the <body> tag.
         */
        writeAfterBodyHtml(out?: NodeJS.WritableStream): void;
        /**
         * Write the footer html to the stream.
         * Try to position this just before the ending </body> tag.
         */
        sendFooterHtml(out?: NodeJS.WritableStream): void;
        
        /**
         * Retreive the data used by NexusFrameworkLoader.load().
         */
        getLoaderData(): any;
    }
    export interface RequestHandler {
        (req: Request, res: Response, next: (err?: Error) => void): void;
    }
    export interface NHPRequestHandler {
        (req: Request, res: Response, next: (err?: Error, renderLocals?: any) => void): void;
    }
    export interface RequestHandlerMethodMapping {
        use?: NHPRequestHandler;
        get?: NHPRequestHandler;
        put?: NHPRequestHandler;
        post?: NHPRequestHandler;
        head?: NHPRequestHandler;
        patch?: NHPRequestHandler;
        del?: NHPRequestHandler;
    }
    export interface RequestHandlerMethodExtendedMapping extends RequestHandlerMethodMapping {
        exists?: ExistsRequestHandler;
        access?: AccessRequestHandler;
    }
    export interface MappedRequestHandler extends RequestHandler, RequestHandlerMethodMapping {}
    export interface ExtendedMappedRequestHandler extends RequestHandler, RequestHandlerMethodExtendedMapping {}
    export interface ExistsRequestHandler {
        (req: Request, res: Response, exists: (err?: Error) => void, doesntExist: () => void): void;
    }
    export interface RouteRequestHandler {
        (req: Request, res: Response, next: (err?: Error, routedpath?: string) => void, skip: () => void): void;
    }
    export interface AccessRequestHandler {
        (req: Request, res: Response, allowed: (err?: Error) => void, denied: () => void): void;
    }
    export interface Handler {
        (req: Request, res: Response, next?: (err: Error) => void): void;
    }
    interface RecursivePath {
        [0]: string;
        [index: number]: RecursivePath | string;
    }
    interface RequestHandlerEntry {
        handle: RequestHandler;
        
        /**
         * Fetches children for this entry.
         */
        children(): RequestHandlerChildEntry[];
        /**
         * Fetches the paths for children of this entry.
         */
        childPaths(cb: (paths: string[]) => void, deep?: false): void;
        /**
         * Fetches the paths for children of this entry recursively.
         */
        childPaths(cb: (paths: (RecursivePath | string)[]) => void, deep: true): void;
        /**
         * Fetches the child at path.
         * 
         * @param path The path to search.
         * @param createIfNotExists Whether or not to create the path if it doesn't exist.
         */
        childAt(path: string, createIfNotExists?: boolean): RequestHandlerChildEntry;
        /**
         * Fetches the child at path.
         * 
         * @param path The path.
         * @param handler The handler to set.
         * @param createIfNotExists Whether or not to create the path if it doesn't exist, true by default.
         */
        setChild(path: string, handler: RequestHandlerChildEntry, createIfNotExists?: boolean): void;
        
        /**
         * Fetches the view filename.
         * 
         * @param type The type of view to fetch, by default its "nhp".
         */
        view(type?: string): string;
        /**
         * Set the view filename for type.
         * 
         * @param filename The view filename
         * @param type The type of view to set, by default its "nhp".
         */
        setView(filename: string, type?: string): void;
        
        /**
         * Fetches the index handler for this entry.
         */
        index(): nexusframework.RequestHandlerEntry;
        /**
         * Set the index handler for this entry.
         */
        setIndex(index: nexusframework.RequestHandlerEntry): void;
        
        /**
         * Fetches the route resolver for this entry.
         */
        routeHandler(): nexusframework.RouteRequestHandler;
        /**
         * Fetches the access handler for this entry.
         */
        accessHandler(): nexusframework.AccessRequestHandler;
        /**
         * Fetches the existence handler for this entry.
         */
        existsHandler(): nexusframework.ExistsRequestHandler;
        /**
         * Set the route resolver for this entry.
         */
        setRouteHandler(index: nexusframework.RouteRequestHandler): void;
        /**
         * Set the access handler for this entry.
         */
        setAccessHandler(index: nexusframework.AccessRequestHandler): void;
        /**
         * Set the existence handler for this entry.
         */
        setExistsHandler(index: nexusframework.ExistsRequestHandler): void;
        /**
         * Destroy this entry and all children
         */
         destroy(): void;
    }
    interface RequestHandlerChildEntry extends RequestHandlerEntry {
        readonly pattern: RegExp;
        readonly rawPattern: string;
    }
    export interface Mount {
        /**
         * The filesystem path.
         */
        fspath: string;
        /**
         * The web path.
         */
        webpath: string;
        /**
         * The skeleton path, if set will override the global skeleton.
         */
        skeleton?: string;
        /**
         * The legacy skeleton path, if set will override the global skeleton.
         */
        legacyskeleton?: string;
        /**
         * Whether or not the fspath should be watched for changes.
         */
        mutable?: boolean;
    }
    export interface Config {
        /**
         * The root path.
         * Must be set to create a mount in the legacy way.
         */
        root?: string;
        /**
         * The pages path, relative to the root path.
         * Default "pages"
         */
        pages?: string;
        /**
         * The URL prefix
         * Default "/"
         */
        prefix?: string;
        /**
         * The path to the skeleton file, relative to the root path.
         * Default "theme/skeleton.nhp"
         */
        skeleton?: string;
        /**
         * The path to the page system skeleton script, relative to the root path.
         */
        pagesysskeleton?: string;
        /**
         * The path to the legacy skeleton file, relative to the root path.
         * Default to a Browser Not Supported message.
         */
        legacyskeleton?: string;
        /**
         * Paths to error documents, relative to the pages path
         */
        errordoc?: {[index: string]: string};
        /**
         * When true, the loader will not be enabled for compatible browsers.
         * The loader is required for the dynamic page system.
         */
        noloader?: boolean;
        /**
         * When true, scripts will not be served on {{prefix}}/:scripts
         */
        noscripts?: boolean;
        /**
         * When true, about will not be served on {{prefix}}/:about
         */
        noabout?: boolean;
        /**
         * When true, disables logging.
         */
        nologging?: boolean;
        /**
         * When true, no Socket.IO instance will be created on {{prefix}}/:io
         */
        noio?: boolean;
        mounts?: Mount[] | Mount;
        modules?: string[] | string;
        [key: string]: any;
    }
}