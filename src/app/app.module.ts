import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './services/interceptor.service';
import locales from '@angular/common/locales/de';
import { AuthGuardService } from './services/auth-guard.service';

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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeyDataContainerComponent } from './components/key-data-container/key-data-container.component';
import { ETerminDashboardRender } from './components/dashboard/renderTrunk/eTerminService/eTerminServiceRender';
import { DashComponent } from './components/dash_comp/dash.component';
import { LineChartComponent } from './components/plots/line-chart/line-chart.component';
import { BarChartComponent } from './components/plots/bar-chart/bar-chart.component';
import { PieChartComponent } from './components/plots/pie-chart/pie-chart.component';
import { NoDataComponent } from './components/no-data/no-data.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { AddUserDialog } from './components/admin/components/addUserDialog';
import { UpdateUserDialog } from './components/admin/components/updateUserDialog';
import { DeleteUserDialog } from './components/admin/components/deleteUserDialog';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LayoutModule } from '@angular/cdk/layout';
import { NgChartsModule } from 'ng2-charts';

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
        component: AdminComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
    ]
  },
  {
    path: '404',
    component: PageNotFoundComponent
  },
  {
    path: '**',
    redirectTo: '/404'
  },
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
    KeyDataContainerComponent,
    ETerminDashboardRender,
    DashComponent,
    LineChartComponent,
    BarChartComponent,
    PieChartComponent,
    NoDataComponent,
    SkeletonLoaderComponent,
    AddUserDialog,
    UpdateUserDialog,
    DeleteUserDialog,
    PageNotFoundComponent
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

}
