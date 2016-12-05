/**
 * Created by vadimdez on 21/06/16.
 */
import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'pdf-viewer-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  pdfSrc: string = './pdf-test.pdf';

  // or pass options as object
  // pdfSrc: any = {
  //   url: './pdf-test.pdf',
  //   withCredentials: true,
  //// httpHeaders: { // cross domain
  ////   'Access-Control-Allow-Credentials': true
  //// }
  // };

  page: number = 1;
  rotation: number = 0;
  zoom: number = 1.0;
  originalSize: boolean = false;
  showAll: boolean = true;
  pdf: any;

  constructor() {
    this.afterLoadComplete = this.afterLoadComplete.bind(this);
  }

  incrementPage(amount: number) {
    this.page += amount;
  }

  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  rotate(angle: number) {
    this.rotation += angle;
  }

  /**
   * Render PDF preview on selecting file
   */
  onFileSelected() {
    var $img: any = document.querySelector('#file');

    if (typeof (FileReader) !== 'undefined') {
      var reader = new FileReader();

      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
      };

      reader.readAsArrayBuffer($img.files[0]);
    }
  }

  /**
   * Get pdf information after it's loaded
   * @param pdf
   */
  afterLoadComplete(pdf: any) {
    this.pdf = pdf;
  }
}
