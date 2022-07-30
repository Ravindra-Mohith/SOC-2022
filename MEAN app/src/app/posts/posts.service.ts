import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], maxPosts: number }>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts(postsperpage: number, pageno: number) {
    const queryParams = `?pageSize=${postsperpage}&pageNo=${pageno}`
    this.http.get<{ status: string, posts: any, maxPosts: number }>('http://localhost:5000/api/posts' + queryParams)
      .pipe(map((res) => {
        return {
          posts: res.posts.map((el: any) => {
            return {
              title: el.title,
              content: el.content,
              mentors: el.mentors,
              mentees: el.mentees,
              category: el.category,
              key: 0,
              id: el._id
            }
          }), maxPosts: res.maxPosts
        }
      }))
      .subscribe((postdata) => {
        this.posts = postdata.posts
        this.postsUpdated.next({ posts: [...this.posts], maxPosts: postdata.maxPosts });
      })
  }

  getPost(Id: string) {
    for (let post of this.posts) {
      if (post.id === Id) return post;
    }
    return
  }

  deletePost(Id: string) {
    return this.http.delete<{ message: string }>('http://localhost:5000/api/posts/' + Id)
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  updatePost(Id: string, title: string, content: string, mentors: Number, mentees: Number, category: string, key: number) {
    const post: Post = { id: Id, title: title, content: content, mentors: mentors, mentees: mentees, category: category, key: key };
    this.http.put<{ message: string }>('http://localhost:5000/api/posts/' + Id, post)
      .subscribe((res) => {
        window.alert(res.message);
        this.router.navigate(['/posts']);
      });
  }

  addPost(title: string, content: string, mentors: Number, mentees: Number, category: string, key: number) {
    const post: Post = { id: '', title: title, content: content, mentors: mentors, mentees: mentees, category: category, key: key };
    this.http.post<{ message: string }>('http://localhost:5000/api/posts', post)
      .subscribe((res) => {
        window.alert(res.message)
        this.router.navigate(['/posts']);
      })
  }
}
