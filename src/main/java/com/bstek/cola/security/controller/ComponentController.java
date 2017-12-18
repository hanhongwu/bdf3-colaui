package com.bstek.cola.security.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bstek.bdf3.security.orm.Component;
import com.bstek.cola.security.service.ComponentService;

/** 
* 
* @author bob.yang
* @since 2017年12月18日
*
*/
@RestController("cola.componentController")
@RequestMapping("/api")
@Transactional(readOnly = true)
public class ComponentController {

	@Autowired
	private ComponentService componentService;
		
	@RequestMapping(path = "/component/load", method = RequestMethod.GET)
	public List<Component> load(@RequestParam("roleId") String roleId, @RequestParam("urlId") String urlId) {
		return componentService.load(roleId, urlId);
	}
	
	@RequestMapping(path = "/component/remove/{id}", method = RequestMethod.DELETE)
	@Transactional
	public void remove(@PathVariable String id) {
		componentService.remove(id);
	}
	
	@RequestMapping(path = "/component/add", method = RequestMethod.POST)
	@Transactional
	public String add(@RequestBody Component component) {
		return componentService.add(component);
	}

	@RequestMapping(path = "/component/modify", method = RequestMethod.PUT)
	@Transactional
	public void modify(@RequestBody Component component) {
		componentService.modify(component);
	}
	
	@RequestMapping(path = "/component/load-by-path", method = RequestMethod.GET)
	@Transactional
	public List<Component> loadByPath(HttpServletRequest request) {
		String path = StringUtils.substringAfter(request.getHeader("Referer"), request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath() + "/");
		return componentService.loadComponentsByPath(path);
	}
}
