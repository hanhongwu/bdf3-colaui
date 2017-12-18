package com.bstek.cola.security.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.bstek.bdf3.security.orm.Url;
import com.bstek.cola.security.service.UrlService;


/** 
* 
* @author bob.yang
* @since 2017年12月15日
*
*/

@RestController("cola.urlController")
@RequestMapping("/api")
@Transactional(readOnly = true)
public class UrlController {

	@Autowired
	private UrlService urlService;
	
	@RequestMapping(path = "/url/load-tree", method = RequestMethod.GET)
	public List<Url> loadTree() {
		return urlService.loadTree();
	}
	
	@RequestMapping(path = "/url/load", method = RequestMethod.GET)
	public List<Url> load() {
		return urlService.load();
	}
	
	@RequestMapping(path = "/url/remove/{id}", method = RequestMethod.DELETE)
	@Transactional
	public void remove(@PathVariable String id) {
		urlService.remove(id);
	}
	
	@RequestMapping(path = "/url/add", method = RequestMethod.POST)
	@Transactional
	public String add(@RequestBody Url url) {
		return urlService.add(url);
	}

	@RequestMapping(path = "/url/modify", method = RequestMethod.PUT)
	@Transactional
	public void modify(@RequestBody Url url) {
		urlService.modify(url);
	}
	
}
