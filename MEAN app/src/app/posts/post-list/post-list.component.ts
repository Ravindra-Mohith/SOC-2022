import { Component, OnInit, OnDestroy } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from 'rxjs';

import { Post } from "../post.model";
import { PostsService } from "../posts.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;
  totalPosts:number
  currentpage = 1
  projsPerPage: number = 4;
  pageSizeOpts: number[] = [4, 5, 10]

  constructor(public postsService: PostsService) { }

  ngOnInit() {
    this.postsService.getPosts(this.projsPerPage, this.currentpage);
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postdata:{posts:Post[],maxPosts:number}) => {
        this.posts = postdata.posts;
        this.totalPosts=postdata.maxPosts;
      });
    //subscribe takes paramaeters, in which first is a callback function when new value is recieved, second is another call back functionwhen error occurs,third one is another function which calls when observable is completed,i.e, no more data to be read.
  }

  onChangedPage(event: PageEvent) {
    this.currentpage = event.pageIndex + 1
    this.projsPerPage = event.pageSize
    this.postsService.getPosts(this.projsPerPage, this.currentpage);
    console.log(event)
  }
  Delete(Id: string) {
    this.postsService.deletePost(Id).subscribe(() => {
      this.postsService.getPosts(this.projsPerPage, this.currentpage)
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    // this will remove the Subscription and prevent memory leaks
  }
}
