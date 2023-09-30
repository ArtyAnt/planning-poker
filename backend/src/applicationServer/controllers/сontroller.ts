import { Router } from "express";

export interface Controller {
    bind() : Router;
}