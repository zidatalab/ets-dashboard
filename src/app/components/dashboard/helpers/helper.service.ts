import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HtmlGenerationService {
  generateHtml(levelSettings: any, dataDateSince: string): string {
    const thema = levelSettings['thema'];
    const resolution = levelSettings['resolution'];
    const containerClass = `textOverviewContainer ${this.getTextClass(thema)}`;
    const resolutionText = this.getResolutionText(resolution, thema);

    return `
      <div class="${containerClass}">
        <span class="textFirst${resolutionText}">Termin${thema}</span>
        <span class="textThird"> seit ${dataDateSince}</span>
      </div>
    `;
  }

  private getTextClass(thema: string): string {
    return {
      Überblick: 'textFirst',
      Terminangebot: 'textFirstOffer',
      Terminnachfrage: 'textFirstDemand',
    }[thema] || '';
  }

  private getResolutionText(resolution: string, thema: string): string {
    if (resolution === 'daily' || resolution === 'weekly') {
      const text = resolution === 'daily' ? 'letzten 30 Tagen' : 'letzten 12 Wochen';
      return ` in den <span class="textSecond">${text}</span>`;
    }
    return '';
  }
}
