import { NexusFramework } from "./src/nexusframework";
import { CacheGenerator } from "lru-weak-cache/types";
import { nexusfork } from "nexusfork/types";

import { Template } from "nhp/lib/Template";

import { Agent, Details } from "useragent";

declare interface UploadedFile {
    /**
     * The original filename when uploaded.
     */
    originalname: string,
    destination: string,
    /**
     * The name of the field the file was uploaded to.
     */
    fieldname: string,
    filename: string,
    mimetype: string,
    /**
     * The full path and filename where the file was uploaded to.
     */
    path: string,
    size: number
}

declare const enum BodyProcessor {
    URLEncoded,
    MultipartFormData,
    JSONBody
}

declare interface AvatarFormats {
  webp: string;
  gif?: string;
  png?: string;
  jpg?: string;
}

declare interface AvatarSizes {
  icon: AvatarFormats;
  small: AvatarFormats;
  medium: AvatarFormats;
  large: AvatarFormats;
  huge: AvatarFormats;
}

declare interface AvatarLookup extends AvatarSizes {
  ["x2"]: AvatarSizes
  ["x3"]: AvatarSizes
  ["x4"]: AvatarSizes
}

declare interface User {
    name?: string;
    id?: string | number;
    displayName?: string;
    email?: string;

    /**
     * Return an avatar at or above the requested size.
     * Or contains the only available avatar as a URL.
     */
    avatar?: string | AvatarLookup;
}
declare interface StaticMountOptions {
    autoIndexSkeleton?: string | Template;
    noOtherMounts?: boolean;
    autoIndex?: boolean;
    mutable?: boolean;
}
declare interface Resource {
    source: string | URL;
    inline?: boolean;
    integrity?: string;
    dependencies?: string[];
}
declare interface Font {
    name: string;
    weight?: number;
    italic?: boolean;
}
declare interface RenderOptions {
    /**
     * The root path.
     */
    root?: string;

    /**
     * The NHP skeleton to use for this mount, relative to the root path (if set).
     */
    skeleton?: string | Template;
    /**
     * The page system skeleton to use for this mount, relative to the root path (if set).
     */
    pagesysskeleton?: string | PageSystemSkeleton;
    /**
     * The legacy NHP skeleton to use for this mount, relative to the root path (if set).
     */
    legacyskeleton?: string | Template;
    /**
     * The NHP skeleton to use for displaying folder directories, relative to the root path (if set).
     */
    autoindexskeleton?: string | Template;

    /**
     * Paths to error documents, relative to the pages of this mount.
     */
    errordoc?: {[index: string]: string};

    fonts?: (Font|string)[];
    scripts?: Resource[];
    styles?: Resource[];

    locals?: ResponseLocals<User>;

    /**
     * Paths to icons.
     */
    icons?: {[index: string]: string | URL};
}
declare interface ImageResizerOptions {
    square?: boolean;
    notransparency?: boolean;
    sizes?: number[] | number[][];
    cache?: number | {minAge?:number,maxAge?:number,capacity?:number,resetTimersOnAccess?:boolean} | false | undefined;
    diskcache?: string;
}
declare interface MountOptions extends RenderOptions {
    /**
     * The path to icon to use in all required sizes, relative to the root path (if set).
     */
    iconfile?: string;

    /**
     * If true, the path will be mounted with filesystem changes applied as they're detected.
     */
    mutable?: boolean;
}
export type ApiTypes = ("bson" | "json" | "debug" | "xml");
export type FunctionOrString = Function | string;
export type FunctionOrStringOrEitherWithData = FunctionOrString | {impl: FunctionOrString, data: any};
declare interface PageSystemSkeleton {
    (template: string, options: any, req: Request, res: Response, next: (err: Error, data?: any) => void): void;
}
export type UserAgentDetails = Agent & Details & {es6?: boolean, legacy?: boolean};
declare interface BaseLocals<U extends User> {
    /**
     * The user, if any;
     */
    user?: U;
    /**
     * Information about the seragent of the request.
     * Provided by seragent.
     */
    useragent?: UserAgentDetails;
    /**
     * Whether or not the client accepts webp.
     */
    webp?: boolean;
    /**
     * Either "webp" or "png" depending on the request.
     */
    webpOrPng?: string;
    /**
     * Either "webp" or "jpg" depending on the request.
     */
    webpOrJpg?: string;
    /**
     * Either "webp" or "gif" depending on the request.
     */
    webpOrGif?: string;
    /**
     * The site url for the directory and domain nexusframework was requested from.
     */
    siteUrl?: string;
    /**
     * The subdirectory nexusframework was requested from, if one.
     */
    sitePrefix?: string;
}
declare interface Request<U extends User> extends BaseLocals<U>, nexusfork.WebRequest {
  res: Response<ResponseLocals<U>>;
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
   * The current mount.
   */
  mount?: RequestHandlerEntry;
  /**
   * True when requested through the Page System API.
   */
  pagesys?: boolean;
  /**
   * The associated Socket.IO Socket, if requested through the page API and using Socket.IO.
   */
  io?: SocketIO.Socket;
  /**
   * The API encoder being used for this request, if any.
   */
  api?: ApiTypes;
  /**
   * True if this request is either .xhr or .io.
   */
  xhrOrIO?: boolean;
  /**
   * Contains an array of uploaded files.
   * These files are destroyed automatically when the response ends.
   */
  files?: {[index: string]: UploadedFile|UploadedFile[]};
  /**
   * Process the request body.
   * By default all processors are usable, and the processor chosen is determined by the request content-type header.
   *
   * @param cb The callback
   * @param processors The processors, all by default
   */
  processBody?(cb: (err?: Error) => void, ...processors: BodyProcessor[]): Request;
  /**
   * Read the request body to a Buffer.
   */
  readBody?(cb: (err: Error, data?: Buffer) => void, limit?: number): void;
  /**
   * The subdirectory nexusframework was requested from, if one.
   */
  buildUrl?(uri?: string): string;
}
declare interface Renderer {
  (out: {write: (data: string) => void},flush?:() => void): void
}
declare interface SocialTags {
    /**
     * The url of the page, will use the request to build this as a fallback when available
     */
    url?: string | URL;
    /**
     * The title of the page, will use res.locals.title as a fallback when available
     */
    title?: string;
    /**
     * The title of the site.
     */
    siteTitle?: string;
    /**
     * The url to an image to display for this page.
     */
    image?: string | URL;
    /**
     * The url to a relevant page.
     */
    seeAlso?: string | URL;
    /**
     * The description of this page.
     */
    description: string;
    /**
     * The type of twitter card, will use summary by default
     */
    twitterCard?: string;

}
declare interface ResponseLocals<U extends User> extends BaseLocals<U> {
  [key: string]: any;
}
declare interface Response<U extends User, L extends ResponseLocals<U>> extends nexusfork.WebResponse {
  locals: L;
  req: Request<U>;
  renderoptions?: RenderOptions;

  /**
   * Render a page using a template engine and serve it.
   * This method will use the skeleton if available, `render` will not.
   *
   * @param filename The absolute path to a file to render, or template source
   * @param options The variables to use for rendering
   */
  sendRender(filename: string, locals?: any): Response;

  /**
   * Replace the render options for this response.
   */
  setRenderOptions(options: RenderOptions): void;
  /**
   * Override the render options for this response.
   */
  applyRenderOptions(options: RenderOptions): void;

  /**
   * Enable the NexusFramework Loader to the script queue, and defer all scripts and styles,
   * as well as display a configurable loading screen.
   */
  enableLoader(): void;

  /**
   * Set a meta tag in the header html.
   */
  setMetaTag(name: string, content?: string): void;
  setSocialTags(info: SocialTags): void;

  /**
   * Add a style to the style queue.
   */
  addStyle(url: string, integrity?: string, ...deps: string[]): void;
  addInlineStyle(source: string, ...deps: string[]): void;
  /**
   * Add a font from Google's library, with the specified weight.
   *
   * @param family The font family
   * @param weight The font weight, default 400
   * @param italic Italic, default false
   */
  addFont(family: string, weight?: number, italic?: boolean): void;
  /**
   * Add a renderer to the header.
   */
  addHeaderRenderer(renderer: Renderer | string): void;
  /**
   * Push the script and style queue.
   * Stores it for popping later.
   *
   * @param andClear And clear the queue
   */
  pushResourceQueues(andClear?: boolean): void;
  /**
   * Pops a script and style queue.
   */
  popResourceQueues(): void;
  clearScripts(): void;
  clearStyles(): void;
  clearFonts(): void;

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
   * Add a renderer to the footer.
   */
  addFooterRenderer(renderer: Renderer | string): void;
  /**
   * Add a script to the script queue.
   */
  addScript(url: string, integrity?: string, ...deps: string[]): void;
  addInlineScript(source: string, ...deps: string[]): void;
  /**
   * Add the Socket.IO Client to the script queue.
   */
  addSocketIOClient(): void;
  /**
   * Add the NexusFramework Client to the script queue.
   *
   * @param includeSocketIO Whether or not to include and rely on Socket.IO, true by default
   * @param autoEnablePageSystem Whether or not to enable the page system automatically, false by default
   */
  addNexusFrameworkClient(includeSocketIO?: boolean, autoEnablePageSystem?: boolean): void;

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
declare interface RequestHandler<I extends Request<User>, O extends Response<User>> {
    (req: I, res: O, next: (err?: Error) => void): void;
}
declare interface NHPRequestHandler<I extends Request<User>, O extends Response<User>> {
    (req: I, res: O, next: (err?: Error, renderLocals?: any) => void): void;
}
declare interface RequestHandlerMethodMapping {
    use?: NHPRequestHandler<any, any>;
    get?: NHPRequestHandler<any, any>;
    put?: NHPRequestHandler<any, any>;
    post?: NHPRequestHandler<any, any>;
    head?: NHPRequestHandler<any, any>;
    patch?: NHPRequestHandler<any, any>;
    del?: NHPRequestHandler<any, any>;
}
declare interface RequestHandlerMethodExtendedMapping extends RequestHandlerMethodMapping {
    exists?: ExistsRequestHandler<any, any>;
    access?: AccessRequestHandler<any, any>;
}
declare interface MappedRequestHandler extends RequestHandler<any, any>, RequestHandlerMethodMapping {}
declare interface ExtendedMappedRequestHandler extends RequestHandler<any, any>, RequestHandlerMethodExtendedMapping {}
declare interface ExistsRequestHandler<I extends Request<User>, O extends Response<User>> {
    (req: I, res: O, exists: (err?: Error) => void, doesntExist: () => void): void;
}
declare interface RouteRequestHandler<I extends Request<User>, O extends Response<User>> {
    (req: I, res: O, next: (err?: Error, routedpath?: string) => void, skip: () => void): void;
}
declare interface AccessRequestHandler<I extends Request<User>, O extends Response<User>> {
    (req: I, res: O, allowed: (err?: Error) => void, denied: () => void): void;
}
declare interface Handler<I extends Request<User>, O extends Response<User>> {
    (req: I, res: O, next?: (err: Error) => void): void;
}
interface RecursivePath {
    [0]: string;
    [index: number]: RecursivePath | string;
}
interface RequestHandlerEntry {
    readonly leaf?: boolean;
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
    index(): RequestHandlerEntry;
    /**
     * Set the index handler for this entry.
     */
    setIndex(index: RequestHandlerEntry): void;

    /**
     * Fetches the route resolver for this entry.
     */
    routeHandler(): RouteRequestHandler;
    /**
     * Fetches the access handler for this entry.
     */
    accessHandler(): AccessRequestHandler;
    /**
     * Fetches the existence handler for this entry.
     */
    existsHandler(): ExistsRequestHandler;
    /**
     * Set the route resolver for this entry.
     */
    setRouteHandler(index: RouteRequestHandler): void;
    /**
     * Set the access handler for this entry.
     */
    setAccessHandler(index: AccessRequestHandler): void;
    /**
     * Set the existence handler for this entry.
     */
    setExistsHandler(index: ExistsRequestHandler): void;
    /**
     * Destroy this entry and all children
     */
     destroy(): void;
}
interface RequestHandlerChildEntry extends RequestHandlerEntry {
    readonly pattern: RegExp;
    readonly rawPattern: string;
}
type APIEncoder<U extends User, L extends ResponseLocals<U>> = (locals: L, req: Request<U>, res: Response<L>) => void;
declare interface Mount extends MountOptions {
    /**
     * The filesystem path.
     */
    fspath: string;
    /**
     * The web path.
     */
    webpath: string;
}
declare interface APIResponse {
  code: number;
  warnings?: string[];
  error?: {
    type: string,
    message: string,
    stack: string
  };

  [key: string]: any;
}
declare interface Config extends MountOptions {
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
    /**
     * When true, no API support will be installed
     */
    noapi?: boolean;
    /**
     * When true, serves the socket.io library to guests too.
     */
    guestio?: boolean;
    /**
     * When true, enables the page system over Socket.IO
     */
    iopagesys?: boolean;
    /**
     * Override the socket.io path
     */
    iopath?: string;
    /**
     * When true, the page system will not be initialized
     */
    nopagesys?: boolean;
    /**
     * Any items in this array are disabled from the built-in API encoders
     */
    apiblacklist?: ApiTypes[];
    /**
     * Any items in this array are filtered from the response of API calls
     */
    apifilter?: string[];
    mounts?: Mount[] | Mount;
    modules?: string[] | string;
    [key: string]: any;
}
