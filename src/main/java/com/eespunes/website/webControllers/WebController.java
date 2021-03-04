package com.eespunes.website.webControllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("animal-instinct")
    public String animalInstinct() {
        return "animal-instinct";
    }


    @GetMapping("pong")
    public String pong() {
        return "pong";
    }
}
