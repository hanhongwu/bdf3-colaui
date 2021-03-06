package com.bstek.cola.orm;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Transient;


/** 
* 
* @author bob.yang
* @since 2017年12月29日
*
*/

@Entity
@Table(name = "BDF3_MESSAGE")
public class Message implements Serializable {

	private static final long serialVersionUID = -8555658312423931884L;

	@Id
	@Column(name = "ID_", length = 64)
	private String id;
	
	@Column(name = "TITLE_", length = 128)
	private String title;
	
	@Column(name = "SENDER_", length = 64)
	private String sender;
	
	@Column(name = "RECEIVER_", length = 1024)
	private String  receiver;
	
	@Column(name = "CONTENT_")
	@Lob
	private String content;
	
	@Column(name = "PATH_", length = 1024)
	private String path;
	
	@Column(name = "TYPE_", length = 64)
	private String type;
	
	@Column(name = "READ_")
	private boolean read;

	@Column(name = "CREATED_AT_")
	private Date createdAt;
	
	@Transient
	private Integer messageCount;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getSender() {
		return sender;
	}

	public void setSender(String sender) {
		this.sender = sender;
	}

	public String getReceiver() {
		return receiver;
	}

	public void setReceiver(String receiver) {
		this.receiver = receiver;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public boolean isRead() {
		return read;
	}

	public void setRead(boolean read) {
		this.read = read;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public Integer getMessageCount() {
		return messageCount;
	}

	public void setMessageCount(Integer messageCount) {
		this.messageCount = messageCount;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	
	
}
