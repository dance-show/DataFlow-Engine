package net.risesoft.y9public.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Comment;

import lombok.Data;
import lombok.NoArgsConstructor;
import net.risesoft.base.BaseEntity;

@Entity
@Table(name = "Y9_DATASERVICE_INTERFACE")
@org.hibernate.annotations.Table(comment = "接口信息表", appliesTo = "Y9_DATASERVICE_INTERFACE")
@NoArgsConstructor
@Data
public class DataInterfaceEntity extends BaseEntity {

	private static final long serialVersionUID = -6083221056448653818L;

	@Id
	@Column(name = "ID", length = 38, nullable = false)
	@Comment(value = "主键")
	private String id;

	@Column(name = "INTERFACENAME", length = 800, nullable = false)
	@Comment(value = "接口名称")
	private String interfaceName;
	
	@Column(name = "INTERFACEURL", length = 500, nullable = false)
	@Comment(value = "接口地址")
	private String interfaceUrl;
	
	@Column(name = "REQUESTTYPE", length = 20, nullable = false)
	@Comment(value = "请求方式")
	private String requestType;
	
	@Column(name = "CONTENTTYPE", length = 50)
	@Comment(value = "content-type")
	private String contentType;
	
	@Column(name = "DATATYPE", nullable = false)
	@Comment(value = "接口类型：1-外置， 0-内置")
	@ColumnDefault("1")
	private Integer dataType;
	
	@Column(name = "PATTERN", nullable = false)
	@Comment(value = "接口数据源传输类型：1-输入，0-输出")
	@ColumnDefault("0")
	private Integer pattern;
	
	@Column(name = "TENANTID", length = 50)
	@Comment(value = "租户ID")
	private String tenantId;
	
	@Column(name = "USERID", length = 50)
	@Comment(value = "创建者ID")
	private String userId;
	
	@Column(name = "USERNAME", length = 50)
	@Comment(value = "创建者")
	private String userName;

}