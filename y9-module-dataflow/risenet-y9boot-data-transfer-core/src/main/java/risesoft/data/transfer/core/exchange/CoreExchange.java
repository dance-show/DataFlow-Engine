package risesoft.data.transfer.core.exchange;

import java.util.List;

import risesoft.data.transfer.core.channel.OutChannel;
import risesoft.data.transfer.core.record.Record;
import risesoft.data.transfer.core.statistics.Communication;
import risesoft.data.transfer.core.statistics.CommunicationTool;

/**
 * 核心交换机用于组织交换机
 * 所有输入数据的汇集位置,包含流量统计流量统计后将流向下游交换机,下游交换机不要进行流量统计
 * @typeName CoreExchange
 * @date 2023年12月12日
 * @author lb
 */
public class CoreExchange implements Exchange {

	private Exchange exchange;

	private Communication communication;

	public CoreExchange(Exchange exchange, Communication communication) {
		super();
		this.exchange = exchange;
		this.communication = communication;
	}

	@Override
	public synchronized void writer(Record record) {
		//所有的数据在此处流向交换机
		communication.increaseCounter(CommunicationTool.READ_SUCCEED_BYTES, record.getByteSize());
		communication.increaseCounter(CommunicationTool.READ_SUCCEED_RECORDS, 1);
		exchange.writer(record);
	}

	@Override
	public synchronized void writer(List<Record> record) {
		//此处
		communication.increaseCounter(CommunicationTool.READ_SUCCEED_BYTES, CommunicationTool.getRecordSize(record));
		communication.increaseCounter(CommunicationTool.READ_SUCCEED_RECORDS, record.size());
		exchange.writer(record);
	}

	@Override
	public synchronized void flush() {
		exchange.flush();
	}

	@Override
	public void close() throws Exception {
		exchange.close();
	}

	@Override
	public void setOutChannel(OutChannel channel) {
		exchange.setOutChannel(channel);
	}

	@Override
	public OutChannel getOutChannel() {
		return exchange.getOutChannel();
	}

	@Override
	public void shutdown() {
		exchange.shutdown();

	}

}
