import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { PostsService } from "../posts.service";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit {
  enteredTitle = "";
  enteredContent = "";
  form: FormGroup

  constructor(public postsService: PostsService) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      mentors: new FormControl(null, { validators: [Validators.required] }),
      mentees: new FormControl(null, { validators: [Validators.required] }),
      category: new FormControl(null, { validators: [Validators.required] }),
      key: new FormControl(0)
    })
  }


  onAddPost() {
    if (this.form.invalid) {
      return;
    }
    this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.mentors, this.form.value.mentees, this.form.value.category,0);
    this.form.reset();
  }
}
