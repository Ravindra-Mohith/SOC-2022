import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PostedComponent } from './posted/posted.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { PostEditComponent } from './posts/post-edit/post-edit.component';
import { PostListComponent } from './posts/post-list/post-list.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create', component: PostCreateComponent },
  { path: 'posts', component: PostListComponent },
  { path: 'posts/:id', component: PostEditComponent },
  { path: 'posted', component: PostedComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
