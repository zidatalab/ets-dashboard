import { NgModule, importProvidersFrom  } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './services/interceptor.service';
import * as PlotlyJS from 'plotly.js-dist-min'
import { PlotlyModule, PlotlyService } from 'angular-plotly.js'
import locales from '@angular/common/locales/de';
// import * as DeLocale from '../../node_modules/plotly.js/lib/locales/de-ch.js'
// import * as SVLocale from 'plotly.js-dist-min/lib/locales/de.js';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './components/navigation/navigation.component';
import { MaterialModule } from '../material/material';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HomeComponent } from './components/layout/home.component';
import { LayoutComponent } from './components/layout/layout.component';
import { PageHeaderComponent } from './components/layout/page-header.component';
import { PrivateAnalysisComponent } from './components/private-analysis/private-analysis.component';
import { PlotContainerComponent } from './components/plot-container/plot-container.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeyDataContainerComponent } from './components/key-data-container/key-data-container.component';
import { ETerminDashboardRender } from './components/dashboard/renderTrunk/eTerminService/eTerminServiceRender';
import { DashComponent } from './components/dash_comp/dash.component';
import { LineChartComponent } from './components/plots/line-chart/line-chart.component';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LayoutModule } from '@angular/cdk/layout';
import { NgChartsModule } from 'ng2-charts';

PlotlyModule.plotlyjs = PlotlyJS

registerLocaleData(locales, 'de');

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'private',
        component: PrivateAnalysisComponent
      },
      {
        path: 'admin',
        component: AdminComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
    ]
  }
]

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    AdminComponent,
    LoginComponent,
    ProfileComponent,
    HomeComponent,
    LayoutComponent,
    PageHeaderComponent,
    PrivateAnalysisComponent,
    PlotContainerComponent,
    KeyDataContainerComponent,
    ETerminDashboardRender,
    DashComponent,
    LineChartComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    PlotlyModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    LayoutModule,
    NgChartsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private plotlyService: PlotlyService) {
    this.setupPlotly()
  }

  private async setupPlotly() {
    const plotly = await this.plotlyService.getPlotly()
    // plotly.register(locales)
    // plotly.setPlotConfig({ locale: 'de' })
  }
}
