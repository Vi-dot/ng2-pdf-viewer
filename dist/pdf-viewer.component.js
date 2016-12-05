"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require('@angular/core');
require('pdfjs-dist/build/pdf.combined');
require('pdfjs-dist/web/pdf_viewer');
var PdfViewerComponent = (function (_super) {
    __extends(PdfViewerComponent, _super);
    function PdfViewerComponent(element) {
        _super.call(this);
        this.element = element;
        this._showAll = false;
        this._renderText = true;
        this._renderAnnotation = true;
        this._originalSize = true;
        this._page = 1;
        this._zoom = 1;
        this.wasInvalidPage = false;
        this._rotation = 0;
        this.isInitialised = false;
        this.pageChange = new core_1.EventEmitter(true);
    }
    PdfViewerComponent.prototype.ngOnInit = function () {
        this.main();
        this.isInitialised = true;
    };
    Object.defineProperty(PdfViewerComponent.prototype, "src", {
        set: function (_src) {
            this._src = _src;
            if (this.isInitialised) {
                this.main();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "page", {
        set: function (_page) {
            _page = parseInt(_page, 10);
            if (!this._pdf) {
                this._page = _page;
                return;
            }
            if (this.isValidPageNumber(_page)) {
                this._page = _page;
                this.renderPage(_page);
                this.wasInvalidPage = false;
            }
            else if (isNaN(_page)) {
                this.pageChange.emit(null);
            }
            else if (!this.wasInvalidPage) {
                this.wasInvalidPage = true;
                this.pageChange.emit(this._page);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "renderText", {
        set: function (renderText) {
            this._renderText = renderText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "renderAnnotation", {
        set: function (renderAnnotation) {
            this._renderAnnotation = renderAnnotation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "originalSize", {
        set: function (originalSize) {
            this._originalSize = originalSize;
            if (this._pdf) {
                this.main();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "showAll", {
        set: function (value) {
            this._showAll = value;
            if (this._pdf) {
                this.main();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "zoom", {
        get: function () {
            return this._zoom;
        },
        set: function (value) {
            if (value <= 0) {
                return;
            }
            this._zoom = value;
            if (this._pdf) {
                this.main();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "rotation", {
        set: function (value) {
            if (!(typeof value === 'number' && value % 90 === 0)) {
                console.warn('Invalid pages rotation angle.');
                return;
            }
            this._rotation = value;
            if (this._pdf) {
                this.main();
            }
        },
        enumerable: true,
        configurable: true
    });
    PdfViewerComponent.prototype.main = function () {
        if (this._pdf && this.lastLoaded === this._src) {
            return this.onRender();
        }
        this.loadPDF(this._src);
    };
    PdfViewerComponent.prototype.loadPDF = function (src) {
        var _this = this;
        PDFJS.workerSrc = 'lib/pdfjs-dist/build/pdf.worker.js';
        window.PDFJS.getDocument(src).then(function (pdf) {
            _this._pdf = pdf;
            _this.lastLoaded = src;
            if (_this.afterLoadComplete && typeof _this.afterLoadComplete === 'function') {
                _this.afterLoadComplete(pdf);
            }
            _this.onRender();
        });
    };
    PdfViewerComponent.prototype.onRender = function () {
        if (!this.isValidPageNumber(this._page)) {
            this._page = 1;
        }
        if (!this._showAll) {
            return this.renderPage(this._page);
        }
        this.renderMultiplePages();
    };
    PdfViewerComponent.prototype.renderMultiplePages = function () {
        var _this = this;
        var container = this.element.nativeElement.querySelector('div');
        var page = 1;
        var renderPageFn = function (page) { return function () { return _this.renderPage(page); }; };
        this.removeAllChildNodes(container);
        var d = this.renderPage(page++);
        for (page; page <= this._pdf.numPages; page++) {
            d = d.then(renderPageFn(page));
        }
    };
    PdfViewerComponent.prototype.isValidPageNumber = function (page) {
        return this._pdf.numPages >= page && page >= 1;
    };
    PdfViewerComponent.prototype.renderPage = function (pageNumber) {
        var _this = this;
        return this._pdf.getPage(pageNumber).then(function (page) {
            var scale = _this._zoom;
            var viewport = page.getViewport(_this._zoom, _this._rotation);
            var container = _this.element.nativeElement.querySelector('div');
            if (!_this._originalSize) {
                scale = _this._zoom * (_this.element.nativeElement.offsetWidth / page.getViewport(1).width) / PdfViewerComponent.CSS_UNITS;
                viewport = page.getViewport(scale, _this._rotation);
            }
            if (!_this._showAll) {
                _this.removeAllChildNodes(container);
            }
            var pdfOptions = {
                container: container,
                id: pageNumber,
                scale: scale,
                defaultViewport: viewport
            };
            if (_this._renderText) {
                pdfOptions['textLayerFactory'] = new PDFJS.DefaultTextLayerFactory();
            }
            if (_this._renderAnnotation) {
                pdfOptions['annotationLayerFactory'] = new PDFJS.DefaultAnnotationLayerFactory();
            }
            var pdfPageView = new PDFJS.PDFPageView(pdfOptions);
            pdfPageView.setPdfPage(page);
            return pdfPageView.draw();
        });
    };
    PdfViewerComponent.prototype.removeAllChildNodes = function (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    };
    PdfViewerComponent.CSS_UNITS = 96.0 / 72.0;
    PdfViewerComponent.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'pdf-viewer',
                    template: "<div class=\"ng2-pdf-viewer-container\" [ngClass]=\"{'ng2-pdf-viewer--zoom': zoom < 1}\"></div>",
                    styles: ["\n.ng2-pdf-viewer--zoom {\n  overflow-x: scroll;\n}\n\n:host >>> .ng2-pdf-viewer-container > div {\n  position: relative;\n}\n\n:host >>> .textLayer {\n  position: absolute;\n  margin-left: auto;\n  margin-right: auto;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  color: #000;\n  font-family: sans-serif;\n  overflow: hidden;\n}\n  "]
                },] },
    ];
    PdfViewerComponent.ctorParameters = [
        { type: core_1.ElementRef, },
    ];
    PdfViewerComponent.propDecorators = {
        'afterLoadComplete': [{ type: core_1.Input, args: ['after-load-complete',] },],
        'src': [{ type: core_1.Input },],
        'page': [{ type: core_1.Input },],
        'pageChange': [{ type: core_1.Output },],
        'renderText': [{ type: core_1.Input, args: ['render-text',] },],
        'renderAnnotation': [{ type: core_1.Input, args: ['render-annotation',] },],
        'originalSize': [{ type: core_1.Input, args: ['original-size',] },],
        'showAll': [{ type: core_1.Input, args: ['show-all',] },],
        'zoom': [{ type: core_1.Input, args: ['zoom',] },],
        'rotation': [{ type: core_1.Input, args: ['rotation',] },],
    };
    return PdfViewerComponent;
}(core_1.OnInit));
exports.PdfViewerComponent = PdfViewerComponent;
//# sourceMappingURL=pdf-viewer.component.js.map