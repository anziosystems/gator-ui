import {Component, ViewEncapsulation, ViewChild, ElementRef, PipeTransform, Pipe, OnInit} from '@angular/core';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';

@Pipe({name: 'safe'})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-candidate-detail',
  templateUrl: './candidate-detail.component.html',
  styleUrls: ['./candidate-detail.component.less'],
})
export class CandidateDetailComponent implements OnInit {
  urlLink: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.urlLink = this.sanitizer.bypassSecurityTrustResourceUrl('https://Gitgator.com');
  }

  resume() {
    this.urlLink = this.sanitizer.bypassSecurityTrustResourceUrl('https://Gitgator.com');
  }
  linkedIn() {
    this.urlLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.linkedin.com/in/rafatsarosh/`);
  }
  twitter() {
    this.urlLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://twitter.com/RafatSarosh`);
  }

  git() {
    this.urlLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://github.com/rsarosh`);
  }

  stackoverflow() {
    this.urlLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://stackoverflow.com`);
  }

  bing() {
    this.urlLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://bing.com`);
  }
}
