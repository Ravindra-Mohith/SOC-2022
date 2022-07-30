import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.css']
})
export class PostEditComponent implements OnInit {
  id: string
  post: Post
  form: FormGroup
  imagePreview: string

  constructor(private route: ActivatedRoute, private postsService: PostsService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.post = this.postsService.getPost(this.id)!;
    this.form = new FormGroup({
      title: new FormControl(this.post.title, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(this.post.content, { validators: [Validators.required] }),
      mentors: new FormControl(this.post.mentors, { validators: [Validators.required] }),
      mentees: new FormControl(this.post.mentees, { validators: [Validators.required] }),
      category: new FormControl(this.post.category, { validators: [Validators.required] }),
      key: new FormControl(this.post.key)
    })
  }

  onEditPost() {
    if (this.form.invalid) {
      return;
    }
    this.postsService.updatePost(this.id, this.form.value.title, this.form.value.content, this.form.value.mentors, this.form.value.mentees, this.form.value.category, this.form.value.key);
    this.form.reset();
  }


}
